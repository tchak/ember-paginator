import Paginator from 'ember-paginator/paginator';

export default Paginator.extend({
  findNextPage(model) {
    return model.nextPage();
  },

  findPage() {
    return reject('Infinity Paginator can not navigate to arbitrary pages.');
  },

  content: computed.readOnly('_model'),

  setCurrentPage(pageNumber, page) {
    return this.get('content');
  }
});
