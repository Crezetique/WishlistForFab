# Wishlist For Fab
A quick custom Wishlist Feature implementation to the Epic Games Fab marketplace.

The Epic Games Fab marketplace currently lacks the ability to wishlist content. Hence, this repo was hastily written as an interim solution. This may or may not be properly rewritten/ improved in the future, feel free to submit changes with a PR.

https://github.com/user-attachments/assets/0be7065a-d48a-4e71-bcfe-653833e7d81a

### Disclaimer
1. Data is stored within Fab.com as browser local storage. _**All data will be lost should local data be cleared.**_
2. As this directly injects and manipulates website content on the Fab Marketplace, please self vet the source code and _**be wary of malicious pull requests and forks**_. 

### Features
- Add to wishlist
- Wishlist page
- Filter wishlist items by On Sale and Category Tag
- Export wishlist as JSON
- Data stored as browser local storage.

### (Potential) Future Plans
- Filter products by Tags.
- Asyncronous on-demand paginate load (Currently loads entire wishlist at one go). 
- Import feature on Wishlist page. Should you need to import a wishlist, save the JSON under the localStorage name "wishlistCustom".
- Compiled as standalone browser addon.

### Installation
A browser extention that "injects javascript and css to specified website" is required for installation.

For Chrome users: https://chromewebstore.google.com/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld

Specify `https://www.fab.com/*` as the domain target for the script injection.