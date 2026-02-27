import * as dotenv from "dotenv";
import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import cors from 'cors';
dotenv.config({quiet: true});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const execAsync = promisify(exec);
const PROJECT_DIR = '/app/vote_private'; 
const isDocker = process.env.DOCKER === 'true' || fsSync.existsSync('/.dockerenv');

if (!isDocker && process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env' });
  console.log('dotenv chargé (mode local non-Docker)');
} else {
  console.log('Mode Docker ou prod – pas de dotenv');
}

console.log('SECRET :', process.env.SECRET);

app.post('/prove', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  console.log("keys:", { received: apiKey, expected: process.env.SECRET });
  if (apiKey !== process.env.SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { params } = req.body;
  if (!Array.isArray(params)) {
    return res.status(400).json({ success: false, error: 'params must be an array' });
  }

  const tempPath = path.join(PROJECT_DIR, 'temp_params.json');
  await fs.writeFile(tempPath, JSON.stringify(params));

  try {
    const cmd = `scarb prove --execute --arguments-file temp_params.json`;

    const { stdout, stderr } = await execAsync(cmd, {
      cwd: PROJECT_DIR,
      timeout: 60000, // 60s max
    });

    console.log('scarb stdout:', stdout);
    if (stderr) console.warn('scarb stderr:', stderr);

    // Trouve le dernier dossier executionN créé (le plus récent)
    // On liste les dossiers execution* et on prend le max par nom ou date
    const executeDir = path.join(PROJECT_DIR, 'target/execute/vote_private');
    const executions = await fs.readdir(executeDir);
    const latestExecution = executions
      .filter(name => name.startsWith('execution'))
      .sort()
      .pop(); // ex. execution5 > execution4

    if (!latestExecution) {
      throw new Error('No execution directory found after proving!');
    }

    const proofPath = path.join(executeDir, latestExecution, 'proof', 'proof.json');

    // Vérifie que le fichier existe
    try {
      await fs.access(proofPath);
    } catch {
      throw new Error(`Proof file not found: ${proofPath}`);
    }

    const proofContent = await fs.readFile(proofPath, 'utf-8');
    const proofData = JSON.parse(proofContent);

    // Nettoyage (optionnel : supprime temp et proof pour ne pas accumuler)
    await fs.unlink(tempPath).catch(() => {});
    // await fs.unlink(proofPath).catch(() => {}); // décommente si tu veux cleanup

    res.json({ success: true, proof: proofData });
  } catch (err: any) {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: err.message || 'scarb prove failed!' });
  }
});

app.listen(4000, () => console.log('Proving service ready on port 4000'));