const { execSync } = require('child_process');

function execCmd(cmd) {
    try {
        return execSync(cmd, { encoding: 'utf8' });
    } catch (e) {
        console.error(`Error running ${cmd}:`, e.message);
        return null;
    }
}

function cleanupImages(repoPath) {
    console.log(`Checking images in ${repoPath}...`);
    const output = execCmd(`gcloud artifacts docker images list ${repoPath} --sort-by="~CREATE_TIME" --format=json`);
    if (!output) return;
    const images = JSON.parse(output);
    if (images.length <= 1) {
        console.log(` <= 1 image found, skipping.`);
        return;
    }
    const toDelete = images.slice(1);
    console.log(`Found ${images.length} images. Deleting ${toDelete.length}...`);
    for (const img of toDelete) {
        console.log(`Deleting ${img.version}...`);
        execCmd(`gcloud artifacts docker images delete ${repoPath}@${img.version} --quiet --delete-tags`);
    }
}

function cleanupBucket(bucket) {
    console.log(`Checking bucket ${bucket}...`); // actually we should use gsutil stat to get dates, but gsutil ls -l works
    const output = execCmd(`gsutil ls -l ${bucket}`);
    if (!output) return;
    const lines = output.trim().split('\n');
    const files = lines.filter(l => l.includes('.zip') && l.includes('gs://')).map(l => {
        const parts = l.trim().split(/\s+/);
        // gsutil ls -l format usually: 1234  2023-01-01T12:00:00Z  gs://bucket/file.zip
        return { size: parts[0], date: parts[1], url: parts.slice(2).join(' ') };
    });
    // Sort by date descending
    files.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (files.length <= 1) {
        console.log(` <= 1 zip file found in ${bucket}, skipping.`);
        return;
    }
    const toDelete = files.slice(1);
    console.log(`Found ${files.length} zip files. Deleting ${toDelete.length}...`);
    for (const f of toDelete) {
        console.log(`Deleting ${f.url}...`);
        execCmd(`gsutil rm "${f.url}"`);
    }
}

cleanupImages('asia-east2-docker.pkg.dev/ace-it-production-1e0a4/cloud-run-source-deploy/ace-it-backend');
cleanupImages('asia-east2-docker.pkg.dev/ace-it-production-1e0a4/cloud-run-source-deploy/ace-it-backend-prod');
cleanupImages('asia-east1-docker.pkg.dev/ace-it-production-1e0a4/cloud-run-source-deploy/ace-it-backend');

cleanupBucket('gs://run-sources-ace-it-production-1e0a4-asia-east2/');
cleanupBucket('gs://run-sources-ace-it-production-1e0a4-asia-east1/');

console.log('Cleanup complete!');
