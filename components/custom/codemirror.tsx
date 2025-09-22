import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link";
import CodeMirror from "@uiw/react-codemirror";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

type CodeMirrorEditorProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: string;
    width?: string;
    className?: string;
};

const CodeMirrorEditor = ({
    value,
    onChange,
    placeholder = "Enter Metadata ...",
    height = "200px",
    width = "full",
    className,
}: CodeMirrorEditorProps) => {
    const [editorValue, setEditorValue] = useState(value);

    useEffect(() => {
        setEditorValue(value);
    }, [value]);

    return (
        <CodeMirror
            value={editorValue}
            className={cn(className, "border rounded-md p-2")}
            basicSetup={{
                foldGutter: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: false,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
            }}
            width={width}
            height={height}
            autoFocus={false}
            placeholder={placeholder}
            extensions={[
                json(),
                lintGutter(),
                hyperLink,
                linter(jsonParseLinter(), {
                    delay: 100,
                }),
            ]}
            onChange={(value) => {
                setEditorValue(value);
                onChange(value);
            }}
        />
    );
};

export default CodeMirrorEditor;
