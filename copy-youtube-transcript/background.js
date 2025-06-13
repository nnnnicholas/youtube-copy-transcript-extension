/* global chrome */

// File-path lookup table
const ICONS = {
  idle:   { 16: 'icon16.png',     32: 'icon32.png',     48: 'icon48.png',     128: 'icon128.png'     },
  ok:     { 16: 'success16.png',  32: 'success32.png',  48: 'success48.png',  128: 'success128.png'  },
  error:  { 16: 'fail16.png',     32: 'fail32.png',     48: 'fail48.png',     128: 'fail128.png'     }
};

function flash(colourKey, tabId, ms = 2000) {
  chrome.action.setIcon({ path: ICONS[colourKey], tabId });
  setTimeout(() => chrome.action.setIcon({ path: ICONS.idle, tabId }), ms);
}

chrome.action.onClicked.addListener(async (tab) => {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copyTranscript
    });
    console.log('Extension result:', result);
    flash(result === 'OK' ? 'ok' : 'error', tab.id);
  } catch (e) {
    console.error(e);
    flash('error', tab.id);
  }
});

// ----------------  injected into page  ----------------
async function copyTranscript() {
  const alertUser = (m) => alert(m);
  
  // Helper function to get transcript from YouTube's DOM
  async function getTranscriptFromYouTubeData() {
    try {
      console.log('Trying to get transcript from YouTube internal data...');
      
      // First, try to find and open the transcript panel
      let transcriptButton = document.querySelector('button[aria-label*="Show transcript" i]') ||
                             document.querySelector('button[aria-label*="transcript" i]') ||
                             document.querySelector('ytd-menu-service-item-renderer:has(yt-formatted-string:has-text("Show transcript"))') ||
                             document.querySelector('[class*="transcript"][role="button"]');
      
      if (transcriptButton && !document.querySelector('ytd-transcript-segment-list-renderer')) {
        console.log('Found transcript button, clicking...');
        transcriptButton.click();
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      
      // Look for transcript segments in various possible selectors
      let segments = document.querySelectorAll('ytd-transcript-segment-renderer');
      
      if (segments.length === 0) {
        segments = document.querySelectorAll('[class*="transcript-segment"]');
      }
      
      if (segments.length === 0) {
        segments = document.querySelectorAll('yt-formatted-string.segment-text');
      }
      
      if (segments.length > 0) {
        console.log('Found transcript segments:', segments.length);
        const transcript = Array.from(segments)
          .map(el => {
            // Try different ways to get the text
            const textEl = el.querySelector('yt-formatted-string.segment-text') || 
                          el.querySelector('[class*="segment-text"]') ||
                          el;
            return textEl.textContent.trim();
          })
          .filter(text => text.length > 0)
          .join('\n');
        
        if (transcript.length > 0) {
          return transcript;
        }
      }
      
      // Try to get ytInitialPlayerResponse from different sources
      let pr = window.ytInitialPlayerResponse;
      
      if (!pr) {
        // Try to find it in the page scripts
        const scripts = Array.from(document.querySelectorAll('script'));
        for (const script of scripts) {
          const match = script.textContent.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/s);
          if (match) {
            try {
              pr = JSON.parse(match[1]);
              break;
            } catch (e) {
              console.log('Failed to parse ytInitialPlayerResponse from script');
            }
          }
        }
      }
      
      if (!pr) {
        console.log('No ytInitialPlayerResponse found');
        return null;
      }
      
      console.log('Found ytInitialPlayerResponse');
      return null;
    } catch (e) {
      console.error('Error getting transcript from YouTube data:', e);
      return null;
    }
  }

  // Helper function to try alternative methods
  async function getTranscriptAlternative() {
    try {
      console.log('Trying alternative transcript extraction...');
      
      // Method 1: Try to trigger transcript load through YouTube's API
      const player = document.querySelector('#movie_player');
      if (player && player.getVideoData) {
        const videoData = player.getVideoData();
        console.log('Video ID:', videoData.video_id);
      }
      
      // Method 2: Look for transcript in engagement panels
      const panels = document.querySelectorAll('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-transcript"]');
      if (panels.length > 0) {
        console.log('Found transcript panel');
        const segments = panels[0].querySelectorAll('ytd-transcript-segment-renderer');
        if (segments.length > 0) {
          const transcript = Array.from(segments)
            .map(el => el.querySelector('yt-formatted-string').textContent.trim())
            .join('\n');
          return transcript;
        }
      }
      
      // Method 3: Try to extract from the page's HTML
      const pageHtml = document.documentElement.innerHTML;
      const captionTracksMatch = pageHtml.match(/"captionTracks":(\[.*?\])/);
      if (captionTracksMatch) {
        try {
          const tracks = JSON.parse(captionTracksMatch[1]);
          console.log('Found caption tracks in HTML:', tracks.length);
          // Note: We can't fetch these URLs due to CORS, but at least we know they exist
        } catch (e) {
          console.log('Failed to parse caption tracks');
        }
      }
      
      return null;
    } catch (e) {
      console.error('Error in alternative method:', e);
      return null;
    }
  }

  // Main function logic
  try {
    console.log('Starting transcript copy...');
    
    // Try to get transcript from YouTube's internal data first
    let transcript = await getTranscriptFromYouTubeData();
    
    if (!transcript) {
      // Try alternative methods
      transcript = await getTranscriptAlternative();
    }
    
    if (!transcript || transcript.length === 0) {
      // Last resort: inform user they need to manually open transcript
      throw new Error('Could not extract transcript. Please manually open the transcript panel (click the three dots below the video → Show transcript), then try again.');
    }
    
    console.log('Final transcript length:', transcript.length);
    console.log('First 100 chars:', transcript.substring(0, 100));

    // Try multiple clipboard methods
    let success = false;
    
    // Method 1: Try navigator.clipboard if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(transcript);
        console.log('Clipboard API succeeded');
        success = true;
      } catch (e) {
        console.log('Clipboard API failed:', e.message);
      }
    }
    
    // Method 2: Use execCommand with focus
    if (!success) {
      const textarea = document.createElement('textarea');
      textarea.value = transcript;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.width = '2em';
      textarea.style.height = '2em';
      textarea.style.padding = '0';
      textarea.style.border = 'none';
      textarea.style.outline = 'none';
      textarea.style.boxShadow = 'none';
      textarea.style.background = 'transparent';
      
      document.body.appendChild(textarea);
      
      // Focus the textarea and select its content
      textarea.focus();
      textarea.select();
      
      // For mobile Safari
      textarea.setSelectionRange(0, textarea.value.length);
      
      try {
        success = document.execCommand('copy');
        console.log('execCommand result:', success);
      } catch (e) {
        console.error('execCommand error:', e);
      }
      
      document.body.removeChild(textarea);
    }
    
    if (!success) {
      throw new Error('Failed to copy to clipboard - try checking browser permissions');
    }
    
    console.log('Copy successful!');
    return 'OK';
  } catch (err) {
    console.error('Error in copyTranscript:', err);
    alertUser(err.message || 'Transcript copy failed.');
    return 'FAIL';
  }
}