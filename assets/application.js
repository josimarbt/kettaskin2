// Put your application javascript here
if (document.getElementById('sort_by') != null) {
    document.querySelector('#sort_by').addEventListener('change', function(e) {
        let url = new URL(window.location.href)
        url.searchParams.set('sort_by', e.currentTarget.value)

        window.location = url.href
    }); 
}

if( document.getElementById('AddressCountryNew') != null ) {
    document.getElementById('AddressCountryNew').addEventListener('change', function(e) {
        var provinces = this.options[this.selectedIndex].getAttribute('data-provinces');
        var provinceSelector = document.getElementById('AddressProvinceNew');
        var provinceArray = JSON.parse(provinces);

        //console.log(provinceArray);
        if(provinceArray.length < 1) {
            provinceSelector.setAttribute('disabled','disabled');
        } else {
            provinceSelector.removeAttribute('disabled');
        }

        provinceSelector.innerHTML = '';
        var options = '';
        for(var i = 0; i < provinceArray.length; i++) {
            options += '<option value="' + provinceArray[i][0] + '">' + provinceArray[i][0] + '</option>';
        }

        provinceSelector.innerHTML = options;
    });
}

//este codigo es para mostrar el form en la pantalla cada vez que el usuario haga click en forgot password.
if(document.getElementById("forgotPassword") != null) {
    document.getElementById("forgotPassword").addEventListener('click', function(e) {
        const element = document.querySelector("#forgot_password_form")
        
        if(element.classList.contains("d-none")){
            element.classList.remove("d-none")
            element.classList.add("d-block")
        }
    })
}

/* este code es para seleccionar el idioma de la pagina mediante a los links de las opciones de idioma
que se muestran, lo hacemos mandando el codigo iso al localization para que este a su vez
traduzca la pagina. Primero tenemos que hacer dinamicos los links para que manden como valor al input
los codigos iso y luego poder enviar el form con estos codigos. */

const localeItems = document.querySelectorAll('#localeItem')
if(localeItems.length > 0) {
    localeItems.forEach(item => {
        item.addEventListener('click', event => {
            document.getElementById('localeCode').value = item.getAttribute('lang')
            document.getElementById('localization_form_tag').submit()
        })
    })
} 

/**This code allow us to show a flotant modal when we clicked on our product cards inside our 
 * collection templates.
 * luego con el fetch estamos utilizando la api de ajax para obtener la informacion de los 
 * productos directo desde el server.
 */

let productInfoAnchors = document.querySelectorAll('#productInfoAnchor');
let productModal;

if(document.getElementById('productInfoModal') != null) {
    productModal = new bootstrap.Modal(document.getElementById('productInfoModal'), {})
}

if(productInfoAnchors.length > 0) {
    productInfoAnchors.forEach(item => {
        item.addEventListener('click', event => {
            let url = '/products/' + item.getAttribute('product-handle') + '.js'

            fetch(url)
            .then((resp) => resp.json())
            .then(function(data) {
                console.log(data)

                document.getElementById('productInfoImg').src = data.images[0]
                document.getElementById('productInfoTitle').innerHTML = data.title
                document.getElementById('productInfoPrice').innerHTML = item.getAttribute('product-price')
                document.getElementById('productInfoDescription').innerHTML = data.description

                let variants = data.variants
                let variantSelect = document.getElementById('modalItemID')
                variantSelect.innerHTML = ''

                if(variants.length != 1) {
                    variants.forEach(function(variant, index){
                        variantSelect.options[variantSelect.options.length] = new Option(variant.option1, variant.id)
                    })
                } else {
                    variantSelect.setAttribute('hidden', 'true')
                    variants.forEach(function(variant, index){
                        variantSelect.options[variantSelect.options.length] = new Option(variant.option1, variant.id)
                    })
                }

                productModal.show()
            })
        })
    })
}

/**Este codigo es para enviar el form del producto al carrito y usamos el e.preventdefault para que
 * no nos mande a otra pagina.
 */

if(document.querySelector('#addToCartForm') != null) {
    let modalAddToCartForm = document.querySelector('#addToCartForm')
    modalAddToCartForm.addEventListener('submit', function(e) {
        e.preventDefault()
    
        let formData = {
            'items': [
                {
                    'id': document.getElementById('modalItemID').value,
                    'quantity': document.getElementById('modalItemQuantity').value
                }
            ]
        }
    
        fetch('/cart/add.js', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then((resp) => {
           return resp.json()
        })
        .then((data) => {
            update_cart()
        })
        .catch((err) => {
            console.error('Error: ' + err)
        })
    })    
}

/**Con este codigo vamos a usar el get como method para actualizar el numero de items que 
 * hay en nuestra card y colocarlo en el navbar.
 */

document.addEventListener('DOMContentLoaded', function () {
    update_cart()
})

function update_cart() {
    fetch('/cart.js')
    .then((resp) => {
        return resp.json()
    })
    .then((data) => {
        document.getElementById('numberOfCartItems').innerHTML = data.items.length
    })
    .catch((err) => console.error(err))
}

let predictiveSearchInput = document.getElementById('searchInputField')
let timer

let offCanvasSearch = document.getElementById('offcanvasSearchResult')
let bsOffCanvas = new bootstrap.Offcanvas(offCanvasSearch)

/**Utilizamos el timer para que no mande tantas solicitudes a la api, sino que las mande luego
 * de un lapso de tiempo estimado y no en cada letra que escribimos para la busqueda 
 * predictiva de productos.
 */

if(predictiveSearchInput != null) {
    predictiveSearchInput.addEventListener('input', function(e) {
        clearTimeout(timer)

        if(predictiveSearchInput.value){
            timer = setTimeout(fetchPredictiveSearch, 2000)
        }
    })
}

/**Este codigo es para realizar una busqueda predictiva de los productos con la Api de ajax
 * en la busqueda de la pagina principal.
 */

function fetchPredictiveSearch() {
    fetch(`/search/suggest.json?q=${predictiveSearchInput.value}&resources[type]=product`)
    .then(resp => resp.json())
    .then(data => {
        console.log(data)

        let products = data.resources.results.products
        document.getElementById('search_results_body').innerHTML = ''

        /**Este codigo es para por cada producto de la busqueda predictiva crear un card
         * y luego mostrar el offcanvas en la pagina mediante el fetch.
         */
        products.forEach(function(product, index){
            document.getElementById('search_results_body').innerHTML += `
            <div class="card" style="width: 19rem;">
                <img src="${product.image}" class="card-img-top">
                <div class="card-body">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text">$${product.price}</p>
                </div>
            </div>
            `
        })

        bsOffCanvas.show()
    })
}