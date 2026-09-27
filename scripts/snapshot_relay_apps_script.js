/**
 * =========================================================================
 * GOOGLE APPS SCRIPT: ANONYMOUS IN-GAME CONSENSUS SNAPSHOT RELAY FOR O.N.E.
 * =========================================================================
 * 
 * Target Repository: https://github.com/kyberlex/ONE
 * File Path: sim/app/public/world_snapshot.json
 * Author: Kyberlex <kyberlex@proton.me>
 * License: AGPL-3.0-or-later
 * 
 * PURPOSE:
 * Allows active web game clients to automatically anchor long-term world
 * state consensus snapshots to GitHub during active gameplay (e.g. hourly
 * or on each circadian cycle) completely anonymously, without requiring player
 * accounts or exposing the private GitHub Personal Access Token in client code.
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
 *    - Value: <your_github_pat_token> (with 'repo' or 'contents:write' scope).
 *    - (Optional) Property: GITHUB_REPO, Value: kyberlex/ONE (default if omitted).
 *    - (Optional) Property: SNAPSHOT_FILE_PATH, Value: sim/app/public/world_snapshot.json
 *    - Click "Save script properties".
 * 5. Deploy as Web App:
 *    - Click the blue "Deploy" (Distribuisci) button in top-right > "New deployment" (Nuova distribuzione).
 *    - Select type: "Web app" (icon of a globe 🌐).
 *    - Description: "O-ASIS Consensus Snapshot Relay".
 *    - Execute as: "Me" (Il mio account: kyberlex...).
 *    - Who has access: "Anyone" (Chiunque - anche anonimo).
 *    - Click "Deploy" (Distribuisci).
 *    - Authorize access when prompted by Google.
 *    - Copy the generated Web App URL:
 *      (e.g., https://script.google.com/macros/s/AKfycb.../exec)
 * 6. Paste the URL into the game client (under Hub -> ⚓ Consensus Git-Anchor -> Relay URL).
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

function getSnapshotFilePath() {
  var props = PropertiesService.getScriptProperties();
  return props.getProperty('SNAPSHOT_FILE_PATH') || 'sim/app/public/world_snapshot.json';
}

/**
 * Health check endpoint (GET request)
 */
function doGet(e) {
  var response = {
    status: 'online',
    service: 'O-ASIS Consensus Snapshot Git-Anchor Relay',
    targetRepo: getTargetRepo(),
    targetPath: getSnapshotFilePath(),
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
    var snapshot = payload.snapshot || payload;

    // 1. Basic schema validation
    if (!snapshot || !snapshot.nodes || snapshot.tick === undefined) {
      return jsonResponse({ success: false, error: 'Invalid snapshot payload: missing nodes or tick.' }, 400);
    }

    var repo = getTargetRepo();
    var token = getGitHubToken();
    var filePath = getSnapshotFilePath();
    var tick = parseInt(snapshot.tick, 10) || 0;
    var hash = snapshot.thermoConsensusHash || payload.hash || '';
    var shortHash = hash ? hash.substring(0, 8) : '';

    var fileApiUrl = 'https://api.github.com/repos/' + repo + '/contents/' + filePath;

    // 2. Fetch current remote file SHA and metadata
    var getOptions = {
      method: 'get',
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'O-ASIS-Snapshot-Relay'
      },
      muteHttpExceptions: true
    };

    var getRes = UrlFetchApp.fetch(fileApiUrl, getOptions);
    var currentSha = null;
    var remoteTick = -1;

    if (getRes.getResponseCode() === 200) {
      var fileData = JSON.parse(getRes.getContentText());
      currentSha = fileData.sha;

      // Check remote tick to ensure monotonically advancing progression
      try {
        if (fileData.content) {
          var decodedContent = Utilities.newBlob(Utilities.base64Decode(fileData.content)).getDataAsString();
          var existingSnapshot = JSON.parse(decodedContent);
          remoteTick = existingSnapshot.tick !== undefined ? parseInt(existingSnapshot.tick, 10) : -1;
        }
      } catch (err) {
        // If parsing existing fails, proceed with overwrite
      }
    }

    // Monotonic guard: do not regress repository to older tick unless force parameter is provided
    if (remoteTick > tick && !payload.force) {
      return jsonResponse({
        success: false,
        skipped: true,
        reason: 'Remote repository is ahead (remote tick ' + remoteTick + ' > incoming tick ' + tick + ').',
        remoteTick: remoteTick,
        incomingTick: tick
      }, 409);
    }

    // 3. Format deterministic JSON content
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

    var putOptions = {
      method: 'put',
      contentType: 'application/json',
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'O-ASIS-Snapshot-Relay'
      },
      payload: JSON.stringify(putPayload),
      muteHttpExceptions: true
    };

    var putRes = UrlFetchApp.fetch(fileApiUrl, putOptions);
    var statusCode = putRes.getResponseCode();
    var resText = putRes.getContentText();

    if (statusCode >= 200 && statusCode < 300) {
      var ghResult = JSON.parse(resText);
      return jsonResponse({
        success: true,
        tick: tick,
        hash: hash,
        commitSha: ghResult.commit ? ghResult.commit.sha : '',
        commitUrl: ghResult.commit ? ghResult.commit.html_url : '',
        fileUrl: ghResult.content ? ghResult.content.html_url : '',
        timestamp: new Date().toISOString(),
        message: 'World snapshot successfully anchored to GitHub ' + repo + ' at ' + filePath
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
