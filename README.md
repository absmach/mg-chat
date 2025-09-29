# SuperMQ Chat

A modern, real-time chat application built with Next.js, featuring multi-workspace support, secure authentication, and seamless messaging powered by the Magistrala.

## Overview

SuperMQ Chat is a collaborative communication platform designed for teams and organizations. It leverages the Magistrala IoT platform's SDK to provide robust backend services, enabling secure, scalable, and real-time messaging across multiple workspaces and channels.

## Features

- **Multi-Workspace Support**: Organize conversations into separate workspaces for different teams or projects
- **Real-Time Messaging**: Instant message delivery with WebSocket connections
- **User Authentication**: Secure login and session management using NextAuth.js
- **Channel Management**: Create and manage public and private channels within workspaces
- **User Invitations**: Invite new users to workspaces
- **User Management**: Profile management and password settings
- **Notifications**: Real-time notifications for new messages and invitations

## Prerequisites

- Node.js 18+ and PNPM
- Magistrala backend instance (for full functionality)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/absmach/mg-chat.git 
   cd mg-chat
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure Magistrala backend connection (refer to Magistrala documentation for setup)

## Usage

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Production Build

Build the application for production:

```bash
pnpm build
pnpm start
```

## Contributing

Thank you for your interest in Magistrala and the desire to contribute!

1. Take a look at our [open issues](https://github.com/absmach/magistrala-docs/issues). The [good-first-issue](https://github.com/absmach/magistrala-docs/labels/good-first-issue) label is specifically for issues that are great for getting started.
2. Check out the [contribution guide](CONTRIBUTING.md) to learn more about our style and conventions.
3. Make your changes compatible with our workflow.
