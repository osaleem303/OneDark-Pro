import { ConfigurationTarget, workspace } from 'vscode'
import { join } from 'path'
import { generateTheme } from '../themes'
import { promptToReload, writeFile } from './index'

function updateTheme() {
  const THEME_PATH = join(__dirname, '../../', 'themes', 'OneDark-Pro.json')
  const theme = generateTheme.fromSettings()
  writeFile(THEME_PATH, theme).then(promptToReload)
}

function getDiffConfig() {
  const defaultTheme = generateTheme.default()
  const newTheme = generateTheme.fromSettings()
  const colorsDiffObj = {}
  const tokenDiffArr = []
  for (const key in defaultTheme.colors) {
    if (defaultTheme.colors[key] !== newTheme.colors[key]) {
      colorsDiffObj[key] = newTheme.colors[key]
    }
  }

  defaultTheme.tokenColors.forEach(item => {
    newTheme.tokenColors.forEach(cell => {
      if (item.scope === cell.scope) {
        if (JSON.stringify(item.settings) !== JSON.stringify(cell.settings)) {
          tokenDiffArr.push(cell)
        }
      }
    })
  })
  return {
    colorsDiffObj,
    tokenDiffArr
  }
}
function rewriteUserConfig() {
  workspace
    .getConfiguration()
    .update(
      `workbench.colorCustomizations.[One Dark Pro]`,
      getDiffConfig().colorsDiffObj,
      ConfigurationTarget.Global
    )
  workspace.getConfiguration().update(
    `editor.tokenColorCustomizations.[One Dark Pro]`,
    {
      textMateRules: getDiffConfig().tokenDiffArr
    },
    ConfigurationTarget.Global
  )
}
function cleanUserConfig() {
  workspace
    .getConfiguration()
    .update(
      `workbench.colorCustomizations.[One Dark Pro]`,
      {},
      ConfigurationTarget.Global
    )
  workspace
    .getConfiguration()
    .update(
      `editor.tokenColorCustomizations.[One Dark Pro]`,
      {},
      ConfigurationTarget.Global
    )
}
export { rewriteUserConfig, cleanUserConfig, updateTheme }
