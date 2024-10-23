/***************************************************
 
    Wishlist for Fab
    by Crezetique

    https://github.com/Crezetique/WishlistForFab

****************************************************/

let wishlistForFab = new function() {
    //#region Extension Settings

        const extensionVersion = '1.0.1'
        const localStorageName_Wishlist = 'wishlistCustom';

        const react_root = __SKFB_REACT_ROOT;

        // Selectors below may need to be updated according to first party changes on the Fab Marketplace.

        const selector_NavActionMenu = '.fabkit-MegaMenu-actions';
        const selector_Sidebar = 'aside.uOXrHl_o .ny_JIXbd';

        const selector_PageListing_Title = 'h1';
        const selector_PageListing_Category = 'nav.fabkit-Breadcrumb-root a';
        const selector_PageListing_Seller = '.fabkit-Badge-root .fabkit-Badge-label';
        // const selector_PageListing_Tags = '.fabkit-Stack--column ul li .fabkit-Tag-label';
        const selector_PageListing_Thumbnail = 'ol.gxEZLyeW li:first-child .FJXTLkFZ img';

        const selector_StoreListing = '.fabkit-Blades-bladesColumnsWrapper .fabkit-BladesColumns-root .fabkit-Thumbnail--16\\/9:has(a), .fabkit-ResultGrid-root li .fabkit-Thumbnail--16\\/9:has(a), .fabkit-ResultGrid-col--sm .fabkit-Thumbnail--16\\/9:has(.fabkit-Thumbnail-item)';
        const selector_StoreListing_Strip = '.fabkit-Stack-root'

        const selector_StoreListing_Title = '.fabkit-Typography-ellipsisWrapper';
        const selector_StoreListing_Category = '.fabkit-Typography-root.fabkit-typography--align-start.fabkit-Text--regular';
        const selector_StoreListing_Seller = '.fabkit-Thumbnail--top-left a';

    //#endregion Extension Settings
    //#region Data Handling

        this.dataWishlist = [];
        this.idStoreListing = null;
        let cacheLocation = null;

        let el_NavActionMenu = document.querySelector(selector_NavActionMenu);
        let el_Sidebar = null;
        let el_WishlistButton = null;
        let el_WishlistNav = null;
        let el_WishlistTab = null;
        let el_WishlistTab_Filters = null;
        let el_WishlistTab_Content = null;
        let el_WishlistTab_Import = null;
        let el_WishlistTab_Export = null;
        let el_WishlistButton_Import = null;
        let el_WishlistButton_Export = null;

        let cache_ListingTags = [];
        let cache_ListingThumbnail = null;

        let filtersWishlistAvailable = [];
        let filtersWishlistReserve = ['2D-Assets', '3D-Model', 'Animations', 'Atlases', 'Audio', 'Brushes', 'Decals', 'Education-&-Tutorial', 'Environment', 'Game-Systems', 'Game-Templates', 'HDRI', 'Material-&-Textures', 'Smart-Assets', 'Tool-&-Plugins', 'UI', 'VFX'];	

        this.isStoreListingPage = function() {
            return window.location.pathname.split('/')[1] === 'listings';
        }

        this.isInWishlist = function(id) {
            return wishlistForFab.dataWishlist.find((element) => element.id === id) !== undefined;
        }

        function getPageListingID() {
            return window.location.pathname.split('/')[2];
        }

        function getPageListingData() {
            if ( !wishlistForFab.isStoreListingPage() || el_Sidebar === null ) {
                return null;
            }

            let image = document.querySelector(selector_PageListing_Thumbnail);
            let image_src = image === null ? '' : image.src

            return {
                id: getPageListingID(),
                name: el_Sidebar.querySelector(selector_PageListing_Title).innerHTML,
                category: el_Sidebar.querySelector(selector_PageListing_Category).innerHTML,
                seller: el_Sidebar.querySelector(selector_PageListing_Seller).innerHTML,
                price: '',
                thumbnail: image_src,
            };
        }
        
        function getStoreListingData(element) {
            let seller;
            if ( window.location.pathname.split('/')[1] === 'sellers' ) {
                seller = window.location.pathname.split('/')[2];
            } else {
                seller = element.querySelector(selector_StoreListing_Seller).lastChild.innerHTML;
            }

            return {
                id: element.getAttribute('wishlist-id'),
                name: element.querySelector(selector_StoreListing_Title).innerHTML,
                category: element.querySelector(selector_StoreListing_Category).lastChild.textContent,
                seller: seller,
                price: '',
                thumbnail: element.querySelector('img').src,
            };
        }

    //#endregion Data Handling
    //#region DOM Templates

        const html_WishlistButton = `
            <div class="fabkit-Surface-root fabkit-Surface--emphasis-background-elevated-low-transparent fabkit-scale--gutterX-spacing-8 fabkit-scale--gutterY-spacing-8 fabkit-Stack-root fabkit-scale--gapX-spacing-4 fabkit-scale--gapY-spacing-4 fabkit-Stack--column ny_JIXbd">
                    <h2 class="fabkit-Typography-root fabkit-typography--align-start fabkit-typography--intent-primary fabkit-Heading--sm">Wishlist</h2>
                    <button id="button_wishlist" class="fabkit-Button--secondary fabkit-Button-root fabkit-Button--md fabkit-Button--fullWidth" type="button">
                    <span class="fabkit-Button-label add">Add to Wishlist</span>
                    <span class="fabkit-Button-label remove">In Wishlist</span>
                </button>
            </div>
        `;
        
        const html_WishlistNav = `
            <li>
                <span class="fabkit-StickyElement-root fabkit-StickyElement--top-right fabkit-StickyElement--show">
                    <button id="megamenu_wishlistToggle" class="fabkit-Button-root fabkit-Button--icon fabkit-Button--sm fabkit-Button--ghost fabkit-MegaMenu-iconButton" type="button">
                        <span class="fabkit-Button-label">
                            <i class="fabkit-Icon-root fabkit-Icon--inherit fabkit-Icon--md fabicon-heart" aria-hidden="true"></i>
                            <i class="fabkit-Icon-root fabkit-Icon--inherit fabkit-Icon--md fabicon-heart-filled" aria-hidden="true"></i>
                        </span>
                    </button>
                </span>
            </li>
        `;
        
        const html_WishlistTab = `
            <div id="tab_wishlist" wishlist-count="0">
                <div class="fabkit-Stack-root fabkit-scale--gapX-layout-10 fabkit-scale--gapY-layout-10 fabkit-Stack--column fabkit-Container-root fabkit-Container--center EqJe4XaR">
                    <div class="fabkit-Stack-root fabkit-Stack--justify_space-between fabkit-scale--gapX-spacing-4 fabkit-scale--gapY-spacing-4">
                        <div>
                            <h2 class="fabkit-Typography-root fabkit-typography--align-start nkhb3MLS"><span class="fabkit-Heading--2xl fabkit-typography--intent-primary">Wishlist For Fab</span> <span class="fabkit-typography--intent-secondary title-sub">by <a href="https://crezetique.com/" target="_blank" class="fabkit-Link--underlined">Crezetique</a></h2>
                            <span class="fabkit-typography--intent-primary">Version ${extensionVersion}</span>
                        </div>
                        <ul class="fabkit-Stack-root fabkit-Stack--align_center fabkit-scale--gapX-layout-3 fabkit-scale--gapY-layout-3 fabkit-Stack--wrap">
                        <!-- <button id="tab_wishlist_import" class="fabkit-Button-root fabkit-Button--md fabkit-Button--secondary" type="button" aria-label="Export Wishlist" aria-toggle="false"><span class="fabkit-Button-label">Import</span></button> -->
                        <button id="tab_wishlist_export" class="fabkit-Button-root fabkit-Button--md fabkit-Button--secondary" type="button" aria-label="Export Wishlist" aria-toggle="false"><span class="fabkit-Button-label">Export</span></button>
                        <button id="tab_wishlist_close" class="fabkit-Button-root fabkit-Button--icon fabkit-Button--md fabkit-Button--secondary" type="button" aria-label="Close Wishlist"><span class="fabkit-Button-label"><i class="fabkit-Icon-root fabkit-Icon--primary fabkit-Icon--sm fabicon-x-mark" aria-hidden="true"></i></span></button>
                        </ul>
                    </div>
                    <!-- <textarea id="wishlist_import" class="fabkit-InputContainer-root fabkit-InputContainer--md fabkit-InputContainer--fullWidth" readonly></textarea> -->
                    <textarea id="wishlist_export" aria-hidden="true" class="fabkit-InputContainer-root fabkit-InputContainer--md fabkit-InputContainer--fullWidth" readonly></textarea>
                    <div class="wishlist-message-empty fabkit-Heading--lg">Your wishlist is empty.</div>
                    <ul id="tab_wishlist_filters" class="fabkit-Stack-root fabkit-Stack--align_center fabkit-scale--gapX-layout-3 fabkit-scale--gapY-layout-3 fabkit-Stack--wrap"></ul>
                    <div class="oHi6n5rt fabkit-Grid-root">
                        <div class="GHXOxKbm">
                            <ul id="tab_wishlist_content" class="fabkit-ResultGrid-root fabkit-ResultGrid-col--sm fabkit-Grid-root fabkit-scale--gapX-layout-6 fabkit-scale--gapY-layout-6"></ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    
        const html_WishlistTabFilter = `fabkit-Tag-root fabkit-Tag--md fabkit-Tag--rounded fabkit-Tag--interactive fabkit-Tag-label`;
    
        const html_ListingWishlistButton = `
            <a class="fabkit-Thumbnail-item fabkit-Thumbnail--bottom-right CERaOIqn">
                <div class="wishlist-listing-toggle fabkit-Badge-root fabkit-Badge--filled fabkit-Badge--gray fabkit-Badge--lg fabkit-Badge--lg--avatarOnly fabkit-Badge--blurify XMY71BJQ fabkit-Focusable-root">
                    <div class="fabkit-Avatar-root fabkit-Avatar--xs">
                        <i class="fabkit-Icon-root fabkit-Icon--inherit fabkit-Icon--md fabicon-heart-filled"></i>
                        <i class="fabkit-Icon-root fabkit-Icon--inherit fabkit-Icon--md fabicon-heart"></i>
                    </div>
                </div>
            </a>
        `

        function formatSingleWishlistListing(data) {
            return `
                <li class="wishlist-listing" listing-category="${data.category.replace(/ /g, '-')}" wishlist-id="${data.id}" wishlist-state="${wishlistForFab.isInWishlist(data.id)}">
                    <div class="fabkit-Stack-root fabkit-scale--gapX-layout-3 fabkit-scale--gapY-layout-3 fabkit-Stack--column hTu1xoWw"><div class="fabkit-Thumbnail-root fabkit-Thumbnail--16/9 fabkit-scale--radius-3 Vq2qCiz2">
                        <a class="fabkit-Thumbnail-root fabkit-Stack--fullWidth fabkit-Stack--fullHeight" href="/listings/${data.id}">
                            <img src="${data.thumbnail}">
                        </a>
                        <div class="fabkit-Thumbnail-item fabkit-Thumbnail--top-left CERaOIqn YFuShsDk">
                            <a class="fabkit-Badge-root fabkit-Badge--filled fabkit-Badge--gray fabkit-Badge--lg fabkit-Badge--lg--avatarOnly fabkit-Badge--blurify XMY71BJQ fabkit-Focusable-root" href="/sellers/${encodeURI(data.seller)}">
                                <div class="fabkit-Avatar-root fabkit-Avatar--xs">
                                    <i class="fabkit-Icon-root fabkit-Icon--primary fabkit-Icon--auto fabicon-user" aria-hidden="true"></i>
                                </div>
                            </a>
                        </div>
                        ${html_ListingWishlistButton}
                    </div>
                    <div class="fabkit-Stack-root fabkit-Stack--align_start fabkit-scale--gapX-spacing-1 fabkit-scale--gapY-spacing-1 fabkit-Stack--fullWidth fabkit-Stack--column">
                        <div class="fabkit-Stack-root fabkit-Stack--fullWidth fabkit-Stack--column"><div class="fabkit-Stack-root fabkit-Stack--align_center fabkit-Stack--justify_space-between fabkit-scale--gapX-spacing-5 fabkit-scale--gapY-spacing-5 fabkit-Stack--fullWidth JCBmZ1xu">
                            <a class="fabkit-Typography-root fabkit-typography--align-start fabkit-typography--intent-primary fabkit-Typography--ellipsis fabkit-Heading--sm qDOIxHMs fabkit-Focusable-root" href="/listings/${data.id}">
                            <div class="fabkit-Typography-ellipsisWrapper">${data.name}</div>
                            </a>
                        </div>
                        <div class="fabkit-Typography-root fabkit-typography--align-start fabkit-typography--intent-secondary fabkit-Text--md fabkit-Text--regular fabkit-Stack-root fabkit-Stack--align_center fabkit-scale--gapX-spacing-2 fabkit-scale--gapY-spacing-2">${data.category}</div>
                            </div>
                        </div>
                    </div>
                </li>
            `;
        }

        function formatSingleWishlistFilter(filter) {
            return `
                <li>
                    <div class="wishlist-filter-button fabkit-Tag-root fabkit-Tag--md fabkit-Tag--rounded fabkit-Tag--interactive" aria-toggle="false" category-filter="${filter}">
                        <span class="fabkit-Tag-label">${filter.replace(/-/g, ' ')}</span>
                    </div>
                </li>
            `
        }

    //#endregion DOM Templates
    //#region DOM Manipulation

        function constructWishlistNav() {
            if (el_NavActionMenu === undefined) return;
            
            el_NavActionMenu.insertAdjacentHTML('afterbegin', html_WishlistNav);
            el_WishlistNav = document.querySelector('#megamenu_wishlistToggle');
            el_WishlistNav.addEventListener('click', () => toggleWishlistTab());
        }

        function constructWishlistTab() {
            if (el_WishlistTab !== null) return;
            
            document.querySelector('main').insertAdjacentHTML('afterbegin', html_WishlistTab);
            el_WishlistTab = document.querySelector('#tab_wishlist');
            el_WishlistTab_Filters = document.querySelector('#tab_wishlist_filters');
            el_WishlistTab_Content = document.querySelector('#tab_wishlist_content');
            el_WishlistTab_Import = document.querySelector('#wishlist_import');
            el_WishlistTab_Export = document.querySelector('#wishlist_export');
            
            // el_WishlistButton_Import = el_WishlistTab.querySelector('#tab_wishlist_import');
            // el_WishlistButton_Import.addEventListener('click', () => { toggleWishlistImport() });
            
            el_WishlistButton_Export = el_WishlistTab.querySelector('#tab_wishlist_export');
            el_WishlistButton_Export.addEventListener('click', () => { toggleWishlistExport() });
            
            let el_WishlistButton_Close = el_WishlistTab.querySelector('#tab_wishlist_close');
            el_WishlistButton_Close.addEventListener('click', () => { toggleWishlistTab() });
            
            populateWishlistExport();
        }

        function constructWishlistSidebar() {
            if (el_Sidebar === null) return;

            if (el_Sidebar.getAttribute('wishlist-initialized') !== 'true') {
                el_Sidebar.setAttribute('wishlist-initialized', 'true');
                el_Sidebar.insertAdjacentHTML('afterend', html_WishlistButton);
                el_WishlistButton = document.querySelector('#button_wishlist');
                el_WishlistButton.addEventListener('click', () => toggleOnWishlist(wishlistForFab.idStoreListing));
            } else {
                el_WishlistButton = document.querySelector('#button_wishlist');
            }

            el_WishlistButton.setAttribute('wishlist-id', wishlistForFab.idStoreListing);
            el_WishlistButton.setAttribute('wishlist-state', wishlistForFab.isInWishlist(wishlistForFab.idStoreListing));
        }

        function populateAllWishlistListing(shouldRepopulate) {
            let IsPopulated = el_WishlistTab.getAttribute('wishlist-populated') === 'true';
            
            if (shouldRepopulate && IsPopulated) { 
                el_WishlistTab_Content.innerHTML = '';
            } else if ( IsPopulated || shouldRepopulate && !IsPopulated ) {
                return;
            }
            
            el_WishlistTab.removeAttribute('wishlist-filter');
            el_WishlistTab.setAttribute('wishlist-populated', 'true');
            el_WishlistTab.setAttribute('wishlist-count', wishlistForFab.dataWishlist.length);
            filtersWishlistAvailable = [];
        
            wishlistForFab.dataWishlist.forEach(data => addWishlistListing(data));
            
            populateWishlistFilters();
        }
        
        function addWishlistListing(data) {
            let categoryFormatted = data.category.replace(/ /g, '-');
            filtersWishlistAvailable.push(categoryFormatted);
            
            el_WishlistTab_Content.insertAdjacentHTML('beforeend', formatSingleWishlistListing(data));

            let listing = document.querySelector(`.wishlist-listing[wishlist-id="${data.id}"]`);
            listing.querySelector('.wishlist-listing-toggle').addEventListener('click', () => { 
                removeFromWishlist(data.id);
            });
        }

        function populateWishlistFilters() {
            let IsPopulated = el_WishlistTab_Filters.getAttribute('filters-populated') === 'true';
            
            if (!IsPopulated) {
                filtersWishlistReserve.forEach(filter => {
                    el_WishlistTab_Filters.insertAdjacentHTML('beforeend', formatSingleWishlistFilter(filter));
                });
                
                document.querySelectorAll('.wishlist-filter-button').forEach(element => {
                    element.addEventListener('click', () => { toggleWishlistFilter(element.getAttribute('category-filter')) });
                });
                
                el_WishlistTab_Filters.setAttribute('filters-populated', true);
            }
            
            filtersWishlistReserve.forEach(filter => {
                let element = document.querySelector(`.wishlist-filter-button[category-filter="${filter}"]`);
                if ( filtersWishlistAvailable.includes(filter) ) {
                    element.parentElement.style.display = 'block';
                    return;	
                }
                
                element.parentElement.style.display = 'none';
            });
    
            clearWishlistFilter();
        }

        function populateWishlistExport() {
            el_WishlistTab_Export.value = JSON.stringify(wishlistForFab.dataWishlist, null , 4);
        }

        function manipulateStoreListing(element) {
            if (element.getAttribute('wishlist-initialized') === 'true') return;

            element.setAttribute('wishlist-initialized', 'true');

            let link = element.nextSibling.querySelector('a').href;
            let link_split = link.split('/')
            let id = link_split[link_split.length - 1];
            
            element.parentNode.setAttribute('wishlist-id', id);
            element.parentNode.setAttribute('wishlist-state', wishlistForFab.isInWishlist(id));

            element.insertAdjacentHTML('beforeend', html_ListingWishlistButton);
            let button = element.querySelector('.wishlist-listing-toggle');
            button.addEventListener('click', () => { toggleOnWishlist(id) });
        }

    //#endregion DOM Manipulation
    //#region Wishlist Functionality

        function addToWishlist(data) {
            wishlistForFab.dataWishlist.push(data);
		    setDataToStorage();

            document.querySelectorAll(`[wishlist-id="${data.id}"]`).forEach(element => {
                element.setAttribute('wishlist-state', 'true');
            });

            if (el_WishlistTab !== null) {
                if (el_WishlistTab.getAttribute('wishlist-populated') === 'true') {
                    addWishlistListing(data);
                }
                
                el_WishlistTab.setAttribute('wishlist-count', wishlistForFab.dataWishlist.length);
                populateWishlistFilters();
            }
        }

        function removeFromWishlist(id) {
            wishlistForFab.dataWishlist = wishlistForFab.dataWishlist.filter((element) => element.id !== id);
		    setDataToStorage();

            document.querySelectorAll(`[wishlist-id="${id}"]`).forEach(element => {
                element.setAttribute('wishlist-state', 'false');
            });
            
            if (el_WishlistTab !== null) {
                let listing = document.querySelector(`.wishlist-listing[wishlist-id="${id}"]`);
                if (listing !== null) {
                    let category = listing.getAttribute('listing-category');
                    listing.remove();
                    
                    if ( el_WishlistTab.querySelectorAll(`.wishlist-listing[listing-category="${category}"]`).length === 0 ) {
                        let arrIndex = filtersWishlistAvailable.indexOf(category);
                        filtersWishlistAvailable.splice(arrIndex, 1);
                    }
                }
                
                el_WishlistTab.setAttribute('wishlist-count', wishlistForFab.dataWishlist.length);
                populateWishlistFilters();
            }
        }

        function toggleOnWishlist(id) {
            let stateChange = !wishlistForFab.isInWishlist(id);
            let data = null;

            if (id === wishlistForFab.idStoreListing) {
                data = getPageListingData();
            } else {
                let element = document.querySelector(selector_StoreListing_Strip + `[wishlist-id="${id}"]`);
            
                data = getStoreListingData(element);    
            }

            if (stateChange) { 
                addToWishlist(data);
                return;
            }
                
            removeFromWishlist(id);
            return;
        }

        function toggleWishlistTab(state) {
            let stateCache = state;
            if (typeof state !== 'boolean') {
                stateCache = !(document.body.getAttribute('wishlist-tab-state') === 'open');
            }

            document.body.setAttribute('wishlist-tab-state', stateCache ? 'open' : 'close');

            if (stateCache) {
                populateAllWishlistListing();
            }
        }

        function toggleWishlistImport() {}

        function toggleWishlistExport() {
            let state = !(el_WishlistButton_Export.getAttribute('aria-toggle') === 'true');

            el_WishlistTab_Export.setAttribute('aria-hidden', !state)
            el_WishlistButton_Export.setAttribute('aria-toggle', state)
        }

        function verifyWishlistImport() {}

        function initialiseWishlistImport() {
            setDataToStorage();
            populateAllWishlistListing(true);
            
            if ( wishlistForFab.isStoreListingPage() ) {
                UpdateWishlistSidebar();
            }
        }

        function clearWishlistFilter() {
            el_WishlistTab.removeAttribute('wishlist-filter');
            
            let previousFilter = document.querySelector(`.wishlist-filter-button[aria-toggle="true"`);
            if (previousFilter !== null) {
                previousFilter.setAttribute('aria-toggle', 'false')
            }
        }

        function toggleWishlistFilter(category) {
            if (category === undefined) {
                console.error('Filter missing category.');
                return;
            };
            
            let previousFilter = document.querySelector(`.wishlist-filter-button[aria-toggle="true"`);
            let nextFilter = document.querySelector(`.wishlist-filter-button[category-filter="${category}"]`);
            let previousFilterState = nextFilter.getAttribute('aria-toggle') === 'true';
            
            if (previousFilter !== null) {
                previousFilter.setAttribute('aria-toggle', 'false')
            }
            
            if (previousFilterState === false) {
                el_WishlistTab.setAttribute('wishlist-filter', category);
            } else {
                el_WishlistTab.removeAttribute('wishlist-filter');
            }
            
            nextFilter.setAttribute('aria-toggle', !previousFilterState);
        }

    //#endregion
    //#region Observers

        // function determinePageChange() {
        // if (locationCache === window.location) return;

        // locationCache = window.location;
        // updateListingData();

        // if (wishlistForFab.isStoreListingPage()) {
        //     constructListingContent();
        // }
        // }

        // window.navigation.addEventListener("navigate", event => { determinePageChange() });

        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

        let observer = new MutationObserver((mutations, observer) => {
            mutations.forEach(mutation => { 
                if (mutation.target.matches(selector_StoreListing)) {
                    manipulateStoreListing(mutation.target);
                    return;
                };

                if (mutation.target.tagName === 'MAIN') {
                    UpdatePageListingData();

                    if (cacheLocation !== window.location.href) {
                        cacheLocation = window.location.href;
                        toggleWishlistTab(false);
                    } 
                };
            });
        });

        observer.observe(react_root, { attributes: false, childList: true, subtree: true });

        window.addEventListener('popstate', () => { 
            UpdatePageListingData();
            toggleWishlistTab(false);
        });

        window.addEventListener('visibilitychange', () => {
            if (document.hidden === true) return;
            
            getDataFromStorage();
            populateAllWishlistListing(true);
            populateWishlistExport;
        });

        function UpdatePageListingData() {
            if (wishlistForFab.isStoreListingPage()) {
                el_Sidebar = document.querySelector(selector_Sidebar);
                wishlistForFab.idStoreListing = getPageListingID();
                
                constructWishlistSidebar();
                return;
            }

            wishlistForFab.idStoreListing = null;
            el_Sidebar = null;
        }

    //#endregion Observers
    //#region Data Storage

        function setDataToStorage() {
            localStorage.setItem(localStorageName_Wishlist, JSON.stringify(wishlistForFab.dataWishlist));
        }

        function getDataFromStorage() {
            let data = localStorage.getItem(localStorageName_Wishlist);
            wishlistForFab.dataWishlist = data === null ? [] : JSON.parse(data);
        }

    //#endregion Data Storage
    //#region Initialization

    this.init = function() {
        getDataFromStorage();

        constructWishlistNav();
        constructWishlistTab();

        document.querySelectorAll(selector_StoreListing).forEach(element => { manipulateStoreListing(element) });

        if (wishlistForFab.isStoreListingPage()) {
            el_Sidebar = document.querySelector(selector_Sidebar);
            wishlistForFab.idStoreListing = getPageListingID();
    
            constructWishlistSidebar();
        }
    }

    //#endregion Initialization
};
setTimeout(() => { wishlistForFab.init() }, 650);