import Paginator from 'ember-paginator/paginator';

// TODO: Need to slice by page size.
// TODO: Need to load more if api is not giving enough for one page.

export default Paginator.extend({
  findPage(model, page) {
    return model.query({ page: {
        number: page,
        size: this.get('pageSize')
      }
    });
  }
});
