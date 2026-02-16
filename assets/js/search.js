var searchIndex = null;
var searchData = null;

function openSearch() {
  var modal = document.getElementById('search-modal');
  modal.style.display = 'flex';
  var input = document.getElementById('search-input');
  input.value = '';
  input.focus();
  document.getElementById('search-results').innerHTML = '';
  document.body.style.overflow = 'hidden';

  if (!searchIndex) {
    loadSearchIndex();
  }
}

function closeSearch() {
  document.getElementById('search-modal').style.display = 'none';
  document.body.style.overflow = '';
}

function loadSearchIndex() {
  var results = document.getElementById('search-results');
  results.innerHTML = '<div class="search-empty">Loading search index...</div>';

  fetch('/search.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      searchData = data;
      searchIndex = lunr(function() {
        this.ref('url');
        this.field('title', { boost: 10 });
        this.field('tags', { boost: 5 });
        this.field('summary', { boost: 3 });
        this.field('content');

        data.forEach(function(doc) {
          this.add({
            url: doc.url,
            title: doc.title,
            tags: (doc.tags || []).join(' '),
            summary: doc.summary,
            content: doc.content
          });
        }, this);
      });
      results.innerHTML = '';
    });
}

function performSearch(query) {
  var results = document.getElementById('search-results');

  if (!query || query.length < 2) {
    results.innerHTML = '';
    return;
  }

  if (!searchIndex) {
    results.innerHTML = '<div class="search-empty">Loading...</div>';
    return;
  }

  var matches;
  try {
    matches = searchIndex.search(query + '~1 ' + query + '*');
  } catch(e) {
    matches = searchIndex.search(query);
  }

  if (matches.length === 0) {
    results.innerHTML = '<div class="search-empty">No results found</div>';
    return;
  }

  var html = '';
  matches.slice(0, 10).forEach(function(match) {
    var doc = searchData.find(function(d) { return d.url === match.ref; });
    if (doc) {
      html += '<a class="search-result" href="' + doc.url + '">' +
        '<div class="search-result__title">' + doc.title + '</div>' +
        '<div class="search-result__meta">' + doc.date +
        (doc.tags && doc.tags.length ? ' &middot; ' + doc.tags.join(', ') : '') +
        '</div></a>';
    }
  });

  results.innerHTML = html;
}

document.addEventListener('keydown', function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    var modal = document.getElementById('search-modal');
    if (modal.style.display === 'flex') {
      closeSearch();
    } else {
      openSearch();
    }
  }
  if (e.key === 'Escape') {
    closeSearch();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  var input = document.getElementById('search-input');
  if (input) {
    input.addEventListener('input', function() {
      performSearch(this.value);
    });
  }
});
