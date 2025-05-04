# QuickNotes

A minimal note-taking application built with HTML, CSS, and JavaScript.

## Features

### Core Features
- Add notes with title and description
- Edit and delete notes
- Notes saved in localStorage (no backend needed)
- Responsive design for all device sizes

### Bonus Features
- Dark mode toggle
- Search/filter notes
- Export notes to .txt file
- Character count
- Keyboard shortcuts (Ctrl+S to save)

## Technologies Used
- HTML5
- CSS3
- JavaScript (Vanilla)
- Font Awesome for icons
- LocalStorage API for data persistence

## Getting Started

1. Clone the repository or download the files
2. Open `index.html` in your web browser
3. Start creating notes!

### Running with a Local Server

To run QuickNotes with a local server:

```bash
# Navigate to the QuickNotes directory
cd QuickNotes

# Start the server
node network-server.js
```

Then open `http://localhost:3000` in your browser.

### Sharing with ngrok

To create a public URL that anyone can access:

```bash
# Install ngrok globally
npm install -g ngrok

# Start the server
node network-server.js

# In a new terminal, create a tunnel
ngrok http 3000
```

This will give you a URL like `https://abc123.ngrok.io` that you can share with anyone!

### Deploying to Vercel

To deploy QuickNotes to Vercel for permanent hosting:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   cd QuickNotes
   vercel
   ```

3. **Or use the deployment script**:
   ```bash
   ./deploy-to-vercel.sh
   ```

For detailed instructions, see the [Vercel Deployment Guide](vercel-deployment.md).

## Usage

- **Create a note**: Fill in the title and content fields, then click "Save"
- **Edit a note**: Click on a note from the list to load it into the editor, make changes, then click "Save"
- **Delete a note**: Click the trash icon on a note in the list
- **Search notes**: Type in the search box to filter notes by title or content
- **Toggle dark mode**: Click the moon/sun icon in the header
- **Export a note**: Select a note and click the "Export" button to download as a text file

## Keyboard Shortcuts

- `Ctrl+S` or `Cmd+S`: Save the current note
- `Escape`: Close any open dialogs

## Browser Support

QuickNotes works in all modern browsers that support ES6 and localStorage:
- Chrome
- Firefox
- Safari
- Edge

## License

This project is open source and available under the MIT License.

## Future Enhancements

Potential future improvements:
- Markdown support
- Categories/tags for notes
- Cloud sync
- Rich text editing
- Note sharing
