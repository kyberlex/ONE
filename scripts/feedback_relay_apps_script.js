/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: ANONYMOUS IN-GAME FEEDBACK & BUG RELAY FOR O.N.E.
 * =========================================================================
 * 
 * Target Repository: https://github.com/kyberlex/ONE
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 * 
 * PURPOSE:
 * Bridges the in-game community feedback form with GitHub Issues & Discussions
 * completely anonymously, with ZERO registration required by the player and
 * ZERO exposure of the private GitHub Personal Access Token.
 * 
 * HOW TO DEPLOY ON GOOGLE APPS SCRIPT:
 * 1. Open Google Drive (under your kyberlex Google account).
 * 2. Click "New" > "More" > "Google Apps Script" (or visit https://script.google.com/home/start).
 * 3. Replace the empty myFunction() with the entire contents of this file.
 * 4. Configure your private GitHub Token:
 *    - Click the Gear icon ⚙️ (Project Settings) on the left sidebar.
 *    - Scroll down to "Script Properties" (Proprietà dello script).
 *    - Click "Edit script properties" > "Add script property".
 *    - Property: GITHUB_TOKEN
 *    - Value: <your_github_pat_token> (with 'repo' or 'public_repo' scope).
 *    - (Optional) Property: GITHUB_REPO, Value: kyberlex/ONE (default if omitted).
 *    - Click "Save script properties".
 * 5. Deploy as Web App:
 *    - Click the blue "Deploy" (Distribuisci) button in top-right > "New deployment" (Nuova distribuzione).
 *    - Select type: "Web app" (icon of a globe 🌐).
 *    - Description: "O-ASIS In-Game Feedback Relay".
 *    - Execute as: "Me" (Il mio account: kyberlex...).
 *    - Who has access: "Anyone" (Chiunque - anche anonimo).
 *    - Click "Deploy" (Distribuisci).
 *    - Authorize access when prompted by Google.
 *    - Copy the generated Web App URL:
 *      (e.g., https://script.google.com/macros/s/AKfycb.../exec)
 * 6. Paste the URL into `sim/app/src/ui/panel_feedback.js` (FEEDBACK_RELAY_URL).
 * =========================================================================
 */

function getTargetRepo() {
  var props = PropertiesService.getScriptProperties();
  return props.getProperty('GITHUB_REPO') || 'kyberlex/ONE';
}

function getGitHubToken() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('GITHUB_TOKEN');
  if (!token) {
    throw new Error('GITHUB_TOKEN script property is not configured in Project Settings.');
  }
  return token.trim();
}

/**
 * Health check endpoint (GET request)
 */
function doGet(e) {
  var response = {
    status: 'online',
    service: 'O-ASIS In-Game Feedback & Community Relay',
    targetRepo: getTargetRepo(),
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Ingestion endpoint (POST request)
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'Empty payload received' }, 400);
    }

    var payload = JSON.parse(e.postData.contents);
    var type = (payload.type || 'idea').toLowerCase();

    // Handle World Snapshot Anchor commit
    if (type === 'snapshot' || payload.action === 'world_snapshot' || payload.snapshot) {
      return handleSnapshotCommit(payload);
    }

    var title = (payload.title || '').trim();
    var description = (payload.description || '').trim();
    var category = payload.category || 'General';
    var bioregion = payload.bioregion || 'Global / Unknown';
    var clientVersion = payload.clientVersion || '0.1.0-alpha';
    var tick = payload.tick !== undefined ? payload.tick : 'N/A';

    if (!title || !description) {
      return jsonResponse({ success: false, error: 'Title and description are required.' }, 400);
    }

    var repo = getTargetRepo();
    var token = getGitHubToken();

    var issueTitle = (type === 'bug' ? '🐛 [Bug]: ' : '💡 [Idea]: ') + title;
    var labels = type === 'bug'
      ? ['bug', 'community-report']
      : ['idea', 'enhancement', 'community-rfc'];

    var markdownBody = '';
    if (type === 'bug') {
      markdownBody = [
        '### 🐛 In-Game Bug Report',
        '',
        '**Description:**',
        description,
        '',
        '---',
        '**System Telemetry & Metadata:**',
        '- **Origin Node / Bioregion:** ' + bioregion,
        '- **Simulation Tick:** ' + tick,
        '- **Client Version:** ' + clientVersion,
        '- **Report Timestamp:** ' + new Date().toISOString(),
        '- **Channel:** O-ASIS Anonymous In-Game Feedback Relay'
      ].join('\n');
    } else {
      markdownBody = [
        '### 💡 In-Game Community Idea / RFC',
        '',
        '**Category:** ' + category,
        '',
        '**Proposal / Hypothesis:**',
        description,
        '',
        '---',
        '**System Telemetry & Metadata:**',
        '- **Origin Node / Bioregion:** ' + bioregion,
        '- **Simulation Tick:** ' + tick,
        '- **Client Version:** ' + clientVersion,
        '- **Report Timestamp:** ' + new Date().toISOString(),
        '- **Channel:** O-ASIS Anonymous In-Game Feedback Relay'
      ].join('\n');
    }

    var githubApiUrl = 'https://api.github.com/repos/' + repo + '/issues';
    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'O-ASIS-Feedback-Relay'
      },
      payload: JSON.stringify({
        title: issueTitle,
        body: markdownBody,
        labels: labels
      }),
      muteHttpExceptions: true
    };

    var res = UrlFetchApp.fetch(githubApiUrl, options);
    var statusCode = res.getResponseCode();
    var resText = res.getContentText();

    if (statusCode >= 200 && statusCode < 300) {
      var ghData = JSON.parse(resText);
      return jsonResponse({
        success: true,
        issueNumber: ghData.number,
        issueUrl: ghData.html_url,
        message: 'Feedback registered successfully on ' + repo
      });
    } else {
      return jsonResponse({
        success: false,
        statusCode: statusCode,
        error: 'GitHub API error: ' + resText
      }, statusCode);
    }

  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.message || String(err)
    }, 500);
  }
}

/**
 * Handles consensus world snapshot anchoring directly to sim/app/public/world_snapshot.json
 */
function handleSnapshotCommit(payload) {
  try {
    var snapshot = payload.snapshot || payload;
    if (!snapshot || !snapshot.nodes || snapshot.tick === undefined) {
      return jsonResponse({ success: false, error: 'Invalid snapshot payload: missing nodes or tick.' }, 400);
    }

    var repo = getTargetRepo();
    var token = getGitHubToken();
    var filePath = 'sim/app/public/world_snapshot.json';
    var tick = parseInt(snapshot.tick, 10) || 0;
    var hash = snapshot.thermoConsensusHash || payload.hash || '';
    var shortHash = hash ? hash.substring(0, 8) : '';

    var fileApiUrl = 'https://api.github.com/repos/' + repo + '/contents/' + filePath;

    var getRes = UrlFetchApp.fetch(fileApiUrl, {
      method: 'get',
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'O-ASIS-Universal-Relay'
      },
      muteHttpExceptions: true
    });

    var currentSha = null;
    var remoteTick = -1;

    if (getRes.getResponseCode() === 200) {
      var fileData = JSON.parse(getRes.getContentText());
      currentSha = fileData.sha;
      try {
        if (fileData.content) {
          var decoded = Utilities.newBlob(Utilities.base64Decode(fileData.content)).getDataAsString();
          var existing = JSON.parse(decoded);
          remoteTick = existing.tick !== undefined ? parseInt(existing.tick, 10) : -1;
        }
      } catch (err) {}
    }

    if (remoteTick > tick && !payload.force) {
      return jsonResponse({
        success: false,
        skipped: true,
        reason: 'Remote repository is ahead (remote tick ' + remoteTick + ' > incoming tick ' + tick + ').',
        remoteTick: remoteTick,
        incomingTick: tick
      }, 409);
    }

    var jsonString = JSON.stringify(snapshot, null, 2) + '\n';
    var base64Content = Utilities.base64Encode(jsonString, Utilities.Charset.UTF_8);
    var commitMsg = 'chore(sim): consensus world snapshot [Tick ' + tick + (shortHash ? ' [Hash: ' + shortHash + ']' : '') + ']';

    var putPayload = {
      message: commitMsg,
      content: base64Content,
      committer: {
        name: 'kyberlex-bot',
        email: 'kyberlex@proton.me'
      }
    };
    if (currentSha) {
      putPayload.sha = currentSha;
    }

    var putRes = UrlFetchApp.fetch(fileApiUrl, {
      method: 'put',
      contentType: 'application/json',
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'O-ASIS-Universal-Relay'
      },
      payload: JSON.stringify(putPayload),
      muteHttpExceptions: true
    });

    var statusCode = putRes.getResponseCode();
    var resText = putRes.getContentText();

    if (statusCode >= 200 && statusCode < 300) {
      var ghResult = JSON.parse(resText);
      return jsonResponse({
        success: true,
        type: 'snapshot',
        tick: tick,
        hash: hash,
        commitSha: ghResult.commit ? ghResult.commit.sha : '',
        commitUrl: ghResult.commit ? ghResult.commit.html_url : '',
        fileUrl: ghResult.content ? ghResult.content.html_url : '',
        timestamp: new Date().toISOString(),
        message: 'Consensus snapshot anchored successfully on ' + repo
      });
    } else {
      return jsonResponse({
        success: false,
        statusCode: statusCode,
        error: 'GitHub API error: ' + resText
      }, statusCode);
    }
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.message || String(err)
    }, 500);
  }
}

function jsonResponse(data, code) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
