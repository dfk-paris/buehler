import {Database, Url, util} from '@wendig/lib'

const db = new Database()
onmessage = db.handler

let storage = {}

const parseTerms = (str) => {
  if (!str) return []

  return str.split(/\s+/).map(s => {
    const m = s.match(/^(\+?)(.*)/)
    let [plus, term] = m.slice(1)
    term = util.fold(term)

    return {plus, term}
  })
}

const matchesArtist = (record, artist) => {
  const folded = util.fold(artist)
  const qid = util.fold(record['Wikidata ID'])
  if (folded == qid) return true

  const regex = new RegExp(folded)
  const name = util.fold(record['Name'])
  const lastName = name.split(',')[0]
  if (lastName.match(regex)) return true

  return false
}

const matchesSurname = (record, query) => {
  let q = util.fold(query)
  q = new RegExp(q)

  const name = util.fold(record['Name'])
  const lastName = name.split(',')[0]

  return !!lastName.match(q)
}

const matchesQid = (record, query) => {
  const q = util.fold(query)
  const qid = util.fold(record['Wikidata ID'])

  return q == qid
}


// db.action('register', (data) => {
//   const results = storage.register[data.letter] || []

//   return {
//     letter: data.letter,
//     records: results.slice(0, 20)
//   }
// })

const query = (data) => {
  let results = storage['records']

  const c = data.criteria
  // const terms = util.fold(c['terms'])
  // const terms = parseTerms(c['terms'])
  const artist = c['artist']
  const ids = c['ids']
  const qid = c['qid']
  // let ref = data.criteria['ref']
  // ref = (ref ? ref.split('|') : [])
  // const dfkId = data.criteria['dfkid']

  // filter (before aggs)

  results = results.filter(record => {
    if (artist) {
      if (!matchesArtist(record, artist)) return false
    }

    if (ids) {
      if (!ids.includes(record['babue_id'])) return false
    }

    return true
  })


  // aggregate

  let letters = {}
  for (const record of results) {
    const l = record['letter']
    letters[l] = letters[l] || 0
    letters[l] += 1
  }

  // filter (after aggs)

  // results = results.filter(record => {
  //   if (c['letter']) {
  //     if (c['letter'] != record['letter']) {
  //       return false
  //     }
  //   }

  //   return true
  // })


  // sort

  results = util.sortBy(results, (r) => util.fold(r['Name']))


  // paginate

  const total = results.length
  const perPage = parseInt(c['per_page'] || '20')
  const page = parseInt(c['page'] || '1')
  results = results.slice((page - 1) * perPage, page * perPage)

  // highlight

  for (const r of results) {
    r['suggest'] = util.highlight(r['Name'], artist)
  }

  // consistency checks
  // if (c['letter'] && !letters[c['letter']]) {
  //   // we are selecting for a letter that would yield no results, so we repeat
  //   // the search with the first letter that WOULD yield results
  //   data['criteria']['letter'] = Object.keys(letters)[0]
  //   return query(data)
  // }

  const response = {
    total,
    results,
    aggs: {letters}
  }
  
  // console.log(response)
  return response
}
db.action('query', query)

db.action('counts', (data) => {
  return {records: storage['records'].length}
})

// const elastify = (agg) => {
//   // console.log(agg, 'x')
//   let result = []

//   for (const k of Object.keys(agg)) {
//     result.push({key: k, doc_count: agg[k]})
//   }

//   return {
//     buckets: util.sortBy(result, e => e.doc_count).reverse()
//   }
// }

const init = (locale) => {
  fetch(staticUrl + '/records.json').then(r => r.json()).then(data => {
    data = enrich(data)
    storage['records'] = data

    console.log(storage)
    db.loaded()
  })
}
db.action('init', init)


// functions

const enrich = (records) => {
  return records.map(record => {
    // calculate first letter
    record['letter'] = record['Name'][0].toLowerCase()

    return record
  })
}

// const toRegister = (records) => {
//   const results = {}

//   for (const record of records) {
//     const label = record[`label`] || ''
//     const letter = util.fold(label[0])

//     results[letter] = results[letter] || []
//     results[letter].push(record)
//   }

//   return results
// }
