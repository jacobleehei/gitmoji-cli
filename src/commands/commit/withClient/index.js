// @flow
import { execa } from 'execa'
import fs from 'fs'
import chalk from 'chalk'

import isHookCreated from '@utils/isHookCreated'
import configurationVault from '@utils/configurationVault'
import { type Answers } from '../prompts'

const withClient = async (answers: Answers): Promise<void> => {
  try {
    const scope = answers.scope ? `(${answers.scope})` : ''
    const splitTitle = answers.title.split(':').map((word) => word.trim())
    if (splitTitle.length != 2) {
      return console.log(
        chalk.red(
          `\nsplit title length is ${splitTitle.length}, please check your title. ` +
            `Sample ---> feat: add a feature.`
        )
      )
    }
    const title = `${splitTitle[0]}${scope}: ${answers.gitmoji}${splitTitle[1]}`
    const isAutoAddEnabled = configurationVault.getAutoAdd()

    if (await isHookCreated()) {
      return console.log(
        chalk.red(
          "\nError: Seems that you're trying to commit with the cli " +
            'but you have the hook created.\nIf you want to use the `gitmoji -c` ' +
            'command you have to remove the hook with the command `gitmoji -r`. \n' +
            'The hook must be used only when you want to commit with the instruction `git commit`\n'
        )
      )
    }

    if (isAutoAddEnabled) await execa('git', ['add', '.'])

    await execa(
      'git',
      ['commit', isAutoAddEnabled ? '-am' : '-m', title, '-m', answers.message],
      {
        buffer: false,
        stdio: 'inherit'
      }
    )
  } catch (error) {
    console.error(
      chalk.red(
        '\n',
        'Oops! An error occurred. There is likely additional logging output above.\n',
        'You can run the same commit with this command:\n'
      ),
      '\t',
      error.escapedCommand
    )
  }
}

export default withClient
