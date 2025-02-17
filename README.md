<img src="https://res.cloudinary.com/dnqiosdb6/image/upload/v1739812292/organi-flow-app-cover_djaeh9.png" alt="organi-flow-app">

## About the Project

**OrganiFlow** is an interactive platform for visualizing and managing organizational structures, ideal for companies of different sizes. The tool enables the creation, editing, and analysis of hierarchies through an intuitive interface with drag-and-drop features.

Try it out: [Live Demo](https://organi-flow-ui.vercel.app)

Main features:
- Interactive hierarchical visualization
- Management of positions and relationships between employees
- Quick editing of information and structure
- Optimized user experience to facilitate organization analysis

--------------------------------------------------

## Environment Setup

### 1. Prerequisites

Make sure the following software is installed on your machine:

- **Node.js** (version 18 or higher)
- **PNPM** (version 8 or higher)
- **Git**

Also, set up the necessary environment variables:

```bash
cp .env.example .env
```

### 2. Project Setup

**a. Repository Clone**  
Clone the repository and access the project directory:

```bash
git clone https://github.com/rafaeelricco/organi-flow-ui
cd organi-flow-frontend
```

**b. Dependencies Installation**  
Install all project dependencies using PNPM:

```bash
pnpm install
```

--------------------------------------------------

## Running the Application

### Development Environment

Start the local server with the command:

```bash
pnpm dev
```

The application will be available at: [http://localhost:3000](http://localhost:3000)

### Production Environment

To generate the production build, use the commands:

```bash
pnpm build
pnpm start
```