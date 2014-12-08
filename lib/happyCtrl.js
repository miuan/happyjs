module.exports.DEF_CTRL_METHODS = ['_get', '_post', '_delete', '_put'];
module.exports.DEF_CTRL_NAME = "Ctrl.js";
/**
 * /*  Output:

 [{
        HAPPY - not method: 'get',
        HAPPY - not path: '/test/{p}/end',
        settings: {
            handler: [Function],
            method: 'get',
            plugins: {},
            app: {},
            validate: {},
            payload: 'stream',
            auth: undefined,
            cache: [Object] }
    }]
/**
 * http://spumko.github.io/resource/api/#server-route-routes-
 * @type {{auth: boolean, params: string}}
 */
var ctrlConfigDefault = {
    /**
     * authorisation - example 'password'
     */
    auth : false,
    /**
     * params - examples:
     *      {params*}
     *      {name?}
     */
    params : ''
}

function fillUpWithConfig(localConf, upConf){
    var conf = localConf;
    if(!conf){
        conf = {};
    }

    // check just the items whic his default config
    // otherwise can by taken config from localconfig for current handler as well
    for(var prop in ctrlConfigDefault){
        if(typeof conf[prop] === 'undefined'){
            // fill up by upConf or default conf
            conf[prop] = upConf ? upConf[prop] : ctrlConfigDefault[prop];
        }
    }

    return conf;
}

module.exports.handler = function(ctrl1, file2, Happy){


    this.connect = function(ctrl, file){
        var ctrlWithHandlers = require(ctrl);
        var ctrlname = (file.split(module.exports.DEF_CTRL_NAME)[0]).toLowerCase();
        var handlerPath = ctrlname != 'index' ?  '/' + ctrlname + '/' : '/';

        // load config for controller from controller
        var configCtrl = null;
        if(typeof ctrlWithHandlers.$getConfig === 'function') {
            configCtrl = fillUpWithConfig(ctrlWithHandlers.$getConfig());
        } else {
            configCtrl = fillUpWithConfig(null);
        }

        console.log('confgCtrl : ');
        console.log(configCtrl);



        for(var handlerName in ctrlWithHandlers){
            var handlerObject = ctrlWithHandlers[handlerName];
            if(typeof handlerObject === 'function'){
                if(handlerName !== '$init' && handlerName !== '$getConfig'){
                    // get config for
                    var configHandler = fillUpWithConfig(configCtrl[handlerName], configCtrl);

                    console.log('confgHandler : ');
                    console.log(configHandler);
                    getMethodAndRegisterRoute(handlerObject, handlerName, handlerPath, configHandler);
                }
            } else {
                console.error('unknow route ' + handlerName + ' in ' + filePath);
            }
        }
    }

    function getMethodAndRegisterRoute(handlerObject, handlerName, handlerPath, configHandler) {
        for (var methodIdx = 0; methodIdx <= module.exports.DEF_CTRL_METHODS.length; methodIdx++) {
            if (methodIdx == module.exports.DEF_CTRL_METHODS.length) {
                console.error('unknow method for handler ' + handlerName);

                var handlerMethods = '';
                module.exports.DEF_CTRL_METHODS.forEach(function (idx, val) {
                    handlerMethods += idx + ' '
                });
                console.info('possible methods for handler:' + handlerMethods);
                console.info('like: ' + handlerName + module.exports.DEF_CTRL_METHODS[0]);
                break;
            }


            var methodType = module.exports.DEF_CTRL_METHODS[methodIdx];
            if (handlerName.indexOf(methodType) != -1) {
                var handlerNameFinal = handlerName.split(methodType)[0];
                if (handlerNameFinal != 'index') {
                    handlerPath += handlerNameFinal + '/';
                }
                    //registerRoute(methodType, handlerPath + '/', handlerObject, 'extra?');


                    // with slash at end
                    // add route like /index/home/ + configHeder.param
                    registerRoute(methodType, handlerPath , function(request, reply){
                        callRoute(handlerObject, request, reply);
                    }, configHandler);


                // without slash on end
                // add route like /index/home
                //registerRoute(methodType, handlerPath, handlerObject, configHandler);
                break;
            }
        }
        return {methodIdx: methodIdx, handlerMethods: handlerMethods, methodType: methodType, handlerNameFinal: handlerNameFinal};
    }

    function callRoute(handlerObject, request, reply){
        var parameters = getParamNames(handlerObject);
        var par = [];

        parameters.forEach(function(parameter,idx){
            par[idx] = getParameter(parameter)
        })

        Happy.server.log('info', parameters);
        console.log('ahoj',parameters);
        handlerObject(par[0], par[1], par[2], par[3], par[4], par[5], par[6], par[7], par[8], par[9], par[10], par[11]);

        function getParameter(parameter){
            if(parameter=='request'){
                return request;
            } else if(parameter=='reply'){
                return reply;
            } else if(parameter=='server'){
                return Happy.server;
            } else if(parameter=='pg'){
                return Happy.pgClient;
            } else if(parameter=='mongo'){
                return Happy.mongoClient;
            }  else if(parameter=='mongoose'){
                return Happy.mongooseClient;
            } else if(parameter=='config'){
                return Happy.config;
            } else {
                return 'unknown param';
            }
        }

    }

    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;
    function getParamNames(func) {
        var fnStr = func.toString().replace(STRIP_COMMENTS, '')
        var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
        if(result === null)
            result = []
        return result
    }

    function registerRoute(methodType, handlerPath, shandler, configHandler){
        //console.log('register' + file + '/' + name);
        var config_handler = {
            handler: shandler,
            auth : configHandler.auth
        };

        var setRoute = {
            method : methodType.substr(1),
            path : handlerPath + configHandler.params ,
            config : config_handler
        };
        // /words/lesson/{params*}
        // /words/lesson/{params*}

        console.log('route ' + setRoute.method + ' ' + setRoute.path)
        // Add the route
        Happy.server.route(setRoute);
    }

    this.connect(ctrl1, file2);
}