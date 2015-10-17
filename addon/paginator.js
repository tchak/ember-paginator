import Ember from 'ember';

const {
  ArrayProxy,
  computed,
  RSVP: { resolve, reject }
} = Ember;

// TODO: Model can be a live array. Handle live changes?

export default ArrayProxy.extend({
  cache: true,
  isLoading: false,
  promise: null,

  currentPage: 1,
  pageSize: null,
  total: null,

  totalPages: computed('total', 'pageSize', function() {
    return Math.ceil(this.total / this.pageSize);
  }),

  nextPageNumber: computed('currentPage', function() {
    return this.get('currentPage') + 1;
  }),

  prevPageNumber: computed('currentPage', function() {
    return this.get('currentPage') - 1;
  }),

  init() {
    this._super(...arguments);

    this.loadFirstPage();
  },

  /*
    @private
  */
  loadFirstPage() {
    this.get('_model').then((model) => {
      let content = model.toArray().slice(0, this.pageSize);

      this.set('content', content);

      if (this.cache) {
        this.cache[1] = resolve(content);
      }
    });
  },

  /*
    @private
    @return Promise
  */
  _model: computed(function() {
    resolve(this.model());
  }),

  /*
    @private
    @return Promise
  */
  loadPage(pageNumber, callback) {
    if (pageNumber < 1) {
      return reject('Already on the first page');
    }

    if (this.get('total') && pageNumber > this.get('totalPages')) {
      return reject('Already on the last page');
    }

    if (this.cache === true) {
      this.cache = {};
    }

    return this.get('_model').then((model) => {
      let promise = this.cache && this.cache[pageNumber];

      if (!promise) {
        this.set('isLoading', true);
        promise = callback(model);
      }

      if (this.cache) {
        this.cache[pageNumber] = promise;
      }

      return promise.then(page => {
        this.set('isLoading', false);

        return this.setCurrentPage(pageNumber, page);
      );
    });
  },

  /*
    @private
    @return Array
  */
  setCurrentPage(pageNumber, page) {
    this.setProperties({
      currentPage: pageNumber,
      content: page
    });
    return page;
  },

  /*
    @private
    @return Promise
  */
  findPage(model, number) {
  },

  /*
    @private
    @return Promise
  */
  findNextPage(model) {
    return this.findPage(model, this.get('nextPageNumber'));
  },

  reload() {
    if (this.cache) { this.cache = {}; }

    return this.page(this.get('currentPage'));
  },

  /*
    @return Promise
  */
  next() {
    return this.loadPage(
      this.get('nextPageNumber'),
      (model) => this.findNextPage(model)
    );
  },

  /*
    @return Promise
  */
  prev() {
    return this.page(this.get('prevPageNumber'));
  },

  /*
    @return Promise
  */
  first() {
    return this.page(1);
  },

  /*
    @return Promise
  */
  last() {
    return this.page(this.get('totalPages'));
  },

  /*
    @return Promise
  */
  page(pageNumber) {
    return this.loadPage(
      pageNumber, (model) => this.findPage(model, pageNumber)
    );
  }
});
