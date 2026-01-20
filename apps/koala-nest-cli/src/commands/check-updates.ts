import https from 'https'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

interface NpmPackageInfo {
  'dist-tags': {
    latest: string
  }
}

export async function checkKoalaUpdates(projectPath?: string): Promise<void> {
  console.log(chalk.blue('\n🔍 Checking for Koala packages updates...\n'))

  try {
    const packagesToCheck = ['@koalarx/nest', '@koalarx/nest-cli']
    const results: Array<{
      package: string
      current: string | null
      latest: string
      needsUpdate: boolean
    }> = []

    // Se projectPath fornecido, ler package.json
    let installedVersions: Record<string, string> = {}
    
    if (projectPath) {
      const packageJsonPath = path.join(projectPath, 'package.json')
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
        installedVersions = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        }
      }
    }

    for (const pkg of packagesToCheck) {
      const latestVersion = await getLatestNpmVersion(pkg)
      const currentVersion = installedVersions[pkg] || null
      
      let cleanCurrent: string | null = null
      if (currentVersion) {
        cleanCurrent = currentVersion.replace(/^[\^~]/, '')
      }

      const needsUpdate = cleanCurrent ? cleanCurrent !== latestVersion : false

      results.push({
        package: pkg,
        current: cleanCurrent,
        latest: latestVersion,
        needsUpdate
      })
    }

    // Mostrar resultados
    let hasUpdates = false
    
    for (const result of results) {
      if (result.current) {
        if (result.needsUpdate) {
          hasUpdates = true
          console.log(chalk.yellow(`   📦 ${result.package}`))
          console.log(chalk.gray(`      Current: v${result.current}`))
          console.log(chalk.green(`      Latest:  v${result.latest} ⬆️`))
        } else {
          console.log(chalk.green(`   ✅ ${result.package}`))
          console.log(chalk.gray(`      v${result.current} (up to date)`))
        }
      } else {
        console.log(chalk.gray(`   ⊘  ${result.package} (not installed)`))
        console.log(chalk.gray(`      Latest: v${result.latest}`))
      }
      console.log()
    }

    if (hasUpdates) {
      console.log(chalk.blue('   💡 To update, run:'))
      console.log(chalk.gray('      bun update @koalarx/nest @koalarx/nest-cli'))
      console.log(chalk.gray('      or'))
      console.log(chalk.gray('      npm update @koalarx/nest @koalarx/nest-cli\n'))
    } else if (results.some(r => r.current)) {
      console.log(chalk.green('   🎉 All Koala packages are up to date!\n'))
    }

  } catch (error) {
    console.error(chalk.red('   ❌ Failed to check for updates:'), error)
    throw error
  }
}

async function getLatestNpmVersion(packageName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'registry.npmjs.org',
      path: `/${packageName}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }

    https.get(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const info: NpmPackageInfo = JSON.parse(data)
          resolve(info['dist-tags'].latest)
        } catch (error) {
          reject(error)
        }
      })
    }).on('error', reject)
  })
}
