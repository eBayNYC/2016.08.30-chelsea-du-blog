var TodayListView = Backbone.View.extend({
    template: _.template($('#todayList').html()),
    initialize: function(options) {
        this.properties = options.properties;
        this.listenTo(this.collection, 'sync change', this.render);
    },
    events: {
        submit: 'submitCollectionForm',
        updateSort: 'updateSort',
        changeSite: 'changeSite',
        copy: 'copy'
    },
    render: function() {
        this.properties.alert = this.collection.alert;
        if (this.properties.alert.type) {
            this.properties.alert.class = this.properties.alert.type === 'error' ? 'alert-danger' : 'alert-success';
        }
        this.$el.html(this.template(this.properties));
        var $list = this.$el.find('ul');
        this.items = this.collection.map(function(model) {
            var item = new TodayItemView({model: model});
            $list.append(item.render().$el);
            return item;
        }, this);

        var self = this;
        $list.sortable({
            stop: function(e, ui) {
                self.$el.trigger('updateSort');
            }
        });

        this.$el.find('.close').on('click', function(e) {
            self.collection.alert.type = null;
            self.properties.alert.type = null;
            $(this).parents('.msg-center').hide();
        });

        return this;
    },
    submitCollectionForm: function(e) {
        e.preventDefault();
        this.collection.save();
    },
    updateSort: function(e) {
        this.items.forEach(function(item) {
            item.model.set('placementId', item.$el.index() + 1);
        });
        this.collection.sort();
        this.render();
    },
    changeSite: function(e, id) {
        this.collection.setSiteId(id);
        this.collection.fetch();
    }
});
