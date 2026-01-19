#!/usr/bin/env node

import program from 'commander'
import inquirer from 'inquirer'
import { newProject } from './commands/new-project/index.js'
import chalk from 'chalk'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const packageJson = JSON.parse(
  readFileSync(join(__dirname, 'package.json'), 'utf-8')
)

const banner = `
  _  __           _         _   _           _      ____ _     ___ 
 | |/ /___   __ _| | __ _  | \\ | | ___  ___| |_   / ___| |   |_ _|
 | ' // _ \\ / _\` | |/ _\` | |  \\| |/ _ \\/ __| __| | |   | |    | |
 | . \\ (_) | (_| | | (_| | | |\\  |  __/\\__ \\ |_  | |___| |___ | |
 |_|\\_\\___/ \\__,_|_|\\__,_| |_| \\_|\\___||___/\\__|  \\____|_____|___|
`

console.log(chalk.cyan(banner))

program.version(packageJson.version)

program
  .command('new [projectName]')
  .description('Cria um novo projeto Nest com Koala Nest')
  .action(async (projectName: string) => {
    if (!projectName) {
      projectName = await inquirer
        .prompt([
          {
            type: 'input',
            name: 'projectName',
            message: 'Informe o nome do projeto',
            validate: (value?: string) =>
              value ? true : 'Não é permitido um nome vazio',
          },
        ])
        .then((answers) => answers.projectName)
    }

    await newProject(projectName)
  })

program.parse(process.argv)
