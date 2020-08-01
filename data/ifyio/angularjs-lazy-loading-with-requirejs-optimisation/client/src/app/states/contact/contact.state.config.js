/**
 * When a user navigates to the 'contact' route (/contact), this file will be consulted to determine whether its lazy dependencies
 * should be loaded individually, or whether a combined version of its lazy dependencies should be loaded. If
 * 'optimize' is set to 'false', its lazy dependencies will be loaded individually from the entries found in the
 * 'lazyDependencies' parameter. If 'optimize' is set to 'true' however, a single file containing the combined
 * dependencies will be loaded, using the path found in 'routeDependencyId'. Note that the 'routeDependencyId' param
 * along with its accompanying dependency definition file is meant to be generated, though the generation has not yet
 * been implemented.
 *
 * If some of its lazy dependencies are shared with other routes, then 'optimize' should be set to 'false' to force
 * the lazy dependencies to be loaded individually. This guarantees that there will be no wastage in bandwidth due
 * to dependencies that are already available to the browser being loaded again. If no lazy dependencies are being
 * used in other routes, or if loading a single optimized file will provide a significant improvement in speed
 * regardless of some wasted bandwidth, then 'opimize' can be set to 'true'.
 *
 * It should be noted that the 'optimize' flag only applies to subsequent (i.e., not the initial) app access. In other
 * words, when the app is initially accessed, a single file containing the combined route dependencies will be
 * delivered to the browser, regardless of the value of the 'optimize' flag. The 'optimize' flag will only come
 * into effect when the user navigates to another route after initially accessing the site.
 *
 * It should also be noted that all script files are minified regardless of whether they are loaded individual or
 * combined. The 'optimize' flag does not affect to minification.
 */
define
({
    routeDependencyId:'app/states/contact/contact.dependencies',
    optimize:false,
    lazyDependencies: [
        'app/states/contact/contact.controller'
    ]
});