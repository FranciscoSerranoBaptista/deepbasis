// run-drizzle-commands.ts
import { exec } from 'child_process';

const commands = [
  'npx drizzle-kit drop',
  'npx drizzle-kit generate',
  'npx drizzle-kit push',
  'npx drizzle-kit migrate'
];

commands.forEach((command) => {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${command}`);
      console.error(error);
      return;
    }
    console.log(`Output for command: ${command}`);
    console.log(stdout);
    if (stderr) {
      console.error(`Error output for command: ${command}`);
      console.error(stderr);
    }
  });
});
