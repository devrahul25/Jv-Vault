const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const secret = crypto.randomBytes(32).toString('hex');
const envPath = path.resolve(process.cwd(), '.env');
const localEnvPath = path.resolve(process.cwd(), '.env.local');

const secretLine = `SESSION_SECRET=${secret}`;

function updateEnv(p) {
    if (fs.existsSync(p)) {
        let content = fs.readFileSync(p, 'utf8');
        if (content.includes('SESSION_SECRET')) {
            console.log(`SESSION_SECRET already exists in ${path.basename(p)}`);
            return;
        }
        fs.appendFileSync(p, `\n${secretLine}\n`);
        console.log(`Added SESSION_SECRET to ${path.basename(p)}`);
    } else {
        fs.writeFileSync(p, `${secretLine}\n`);
        console.log(`Created ${path.basename(p)} with SESSION_SECRET`);
    }
}

// Prefer .env.local for local dev
updateEnv(localEnvPath);
