# Copy YouTube Transcript Extension

A simple Chrome extension that allows you to copy the full transcript of any YouTube video with a single click.

## Features

- 🎯 **One-click copying** - Click the extension icon to instantly copy the transcript
- 📝 **Full transcript extraction** - Gets the complete video transcript, not just captions
- 🌍 **Multi-language support** - Prioritizes English but works with any available language
- ✅ **Visual feedback** - Icon changes to show success (✓) or failure (✗)
- 🔒 **Privacy-focused** - Works entirely locally, no data sent to external servers

## Installation

### From Chrome Web Store
*Coming soon - extension will be published to the Chrome Web Store*

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `copy-youtube-transcript` folder
5. The extension icon should appear in your toolbar

## Usage

1. Navigate to any YouTube video with captions/transcript available
2. Click the extension icon in your Chrome toolbar
3. The transcript will be copied to your clipboard automatically
4. The icon will briefly show:
   - ✅ Green checkmark for success
   - ❌ Red X for failure

### Troubleshooting

If the extension doesn't work:
1. Make sure the video has captions/transcript available
2. Try manually opening the transcript panel first:
   - Click the three dots (⋯) below the video
   - Select "Show transcript"
   - Then click the extension icon
3. Check that the page has finished loading completely

## How It Works

The extension:
1. Searches for YouTube's transcript data in the page DOM
2. Attempts to automatically open the transcript panel if needed
3. Extracts the transcript text from the loaded elements
4. Copies the text to your clipboard using the browser's clipboard API

## Permissions

The extension requires these permissions:
- `activeTab` - To access the current YouTube tab
- `scripting` - To run the transcript extraction script
- `clipboardWrite` - To copy the transcript to your clipboard

## Development

### Project Structure
```
copy-youtube-transcript/
├── manifest.json          # Extension configuration
├── background.js          # Main extension logic
├── icon16.png            # Extension icon (16x16)
├── icon32.png            # Extension icon (32x32)
├── icon48.png            # Extension icon (48x48)
├── icon128.png           # Extension icon (128x128)
├── success16.png         # Success state icons
├── success32.png
├── success48.png
├── success128.png
├── fail16.png            # Error state icons
├── fail32.png
├── fail48.png
└── fail128.png
```

### Building
No build process required - this is a pure JavaScript Chrome extension.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Repository

[https://github.com/nnnnicholas/youtube-copy-transcript-extension](https://github.com/nnnnicholas/youtube-copy-transcript-extension)

## Known Limitations

- Only works on YouTube videos that have captions/transcripts available
- May not work on videos with restricted access or age-gated content
- Depends on YouTube's DOM structure (may break if YouTube changes their layout)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### Version 1.1.1
- Initial release
- Basic transcript extraction and copying functionality
- Visual feedback with icon state changes
- Support for multiple languages with English preference 