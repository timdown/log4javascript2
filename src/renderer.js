(function(api) {
    function Renderer(testFn, renderFn) {
        this.shouldRender = testFn;
        this.doRender = renderFn;
    }

    var renderers = [];

    Renderer.forInstancesOf = function(constructorFn, renderFn) {
        return new Renderer(
            function(obj) {
                return obj instanceof constructorFn;
            },
            renderFn
        );
    };

    function getRenderer(obj) {
        var i = renderers.length, renderer;
        while (i--) {
            renderer = renderers[i];
            if (renderer.shouldRender(obj)) {
                return renderer;
            }
        }
        return null;
    }

    api.getRenderer = getRenderer;

    api.addRenderer = function(testFn, renderFn) {
        renderers.push(new Renderer(testFn, renderFn));
    };

    api.addRendererForInstancesOf = function(constructorFn, renderFn) {
        renderers.push(Renderer.forInstancesOf(constructorFn, renderFn));
    };

    api.Renderer = Renderer;
})(log4javascript);
