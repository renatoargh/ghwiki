# ghwiki

### Example

```javascript
const Wiki = require('ghwiki')

const wiki = new Wiki({
  user: 'renatoargh',
  accessToken: 'yourTokenOrPassword',
  repo: 'renatoargh/ghwiki'
})

console.log('Cloning URL:', wiki.url())

wiki.clone(err => {
  if (err) {
    throw err
  }

  const path = wiki.path('/this-is-a-test.md')
  fs.writeFileSync(path, '# Test!')

  wiki.ls((err, items) => {
    if (err) {
      throw err
    }

    console.log(wiki.path())
    console.log(JSON.stringify(items, null, 4))

    wiki.commitAndPush('Testing...', err => {
      if (err) {
        throw err
      }

      wiki.cleanup()
    })
  })
})

```

### MIT