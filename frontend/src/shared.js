import DfkFrontend from '@dfk-paris/frontend'
DfkFrontend.configure({
  staticUrl: staticUrl
})

import * as riot from 'riot'
import {bus, BusRiotPlugin} from '@wendig/lib'
import {i18n, RiotPlugins} from '@wendig/lib'

import search from './lib/search'

import App from './components/app.riot'
import DfkIcon from '@dfk-paris/frontend/src/components/icon.riot'

function defaultLocale() {
  const url = document.location.href
  const locale = url.match(/^https:\/\/dfk-paris\.org\/([a-z]{2})/)

  if (locale) return locale[1] 

  return 'de'
}

i18n.setLocale(defaultLocale())
i18n.setFallbacks(['fr', 'de', 'en'])
search.init(defaultLocale())

i18n.fetch(`${DfkFrontend.config().staticUrl}/translations.json`).then(() => {
  RiotPlugins.setup(riot)
  riot.install(RiotPlugins.i18n)
  riot.install(RiotPlugins.parent)
  riot.install(RiotPlugins.setTitle)
  riot.install(BusRiotPlugin)

  riot.register('app', App)
  riot.register('dfk-icon', DfkIcon)

  riot.mount('[is]')

  console.log('mounting complete!')
})
