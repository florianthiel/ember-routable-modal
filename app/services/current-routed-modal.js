import $ from 'jquery';
import Service, { inject as service } from '@ember/service';
import { observer } from '@ember/object';
import Config from 'ember-routable-modal/configuration';

export default Service.extend({
    routing: service('-routing'),
    router: service(),
    routeName: null,
    activeListener: observer('routeName', function() {
        if (typeof $ !== 'undefined') {
            $('body')[this.get('routeName') ? 'addClass' : 'removeClass'](Config.modalOpenBodyClassName);
        }
    }),
    init() {
        this._super(...arguments);

        if (typeof $ !== 'undefined' && typeof window !== 'undefined') {
            $(window).on('popstate.ember-routable-modal', () => {
                if (this.get('routeName') !== this.get('routing.router.currentRouteName')) {
                    this.set('routeName', null);
                }
            });
        }
    },
    clear() {
        if (this.get('routeName')) {
            this.set('routeName', null);
        }
    },
    close() {
        const routerMain = this.get('routing.router');
        const routerLib = routerMain._routerMicrolib || routerMain.router;
        const handlerInfos = routerLib.state.handlerInfos;
        const currentController = handlerInfos[handlerInfos.length - 1]._route.controller;

        this.set('routeName', null);

        if (currentController._isModalRoute) {
            const parentRoute = handlerInfos[handlerInfos.length - 2].name;

            routerLib.transitionTo(parentRoute);
        } else {
            const url = this.get('router').urlFor(this.get('router.currentRouteName'))

            routerLib.updateURL(url);
        }
    }
});
