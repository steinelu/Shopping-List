
document.addEventListener('click', (e) => {
	/*if(e.target.tagName=="DIV" && e.target.classList.contains("item")){
		handleItemClicked(e.target)
	}
	if(e.target.parentNode.classList.contains("item")){
		handleItemClicked(e.target.parentNode)
	}*/

	var item = e.target.closest(".item")
	if (item){
		handleItemClicked(item)
	}
});


function handleItemClicked(target){
	var container = target.parentNode
	var element = target

	if (container.id == "selected") {
		document.getElementById("history").appendChild(element)
	}
	else {
		document.getElementById("selected").appendChild(element)
	}
}


// https://copyprogramming.com/howto/javascript-handle-mouse-hold-event-js-code-example
var timer
function mouseDown(e){
	console.log("holding")
	if (timer){
		window.clearTimeout(timer)
	}

	timer = window.setTimeout(() => {
		console.log("timer fired")
		//e.target.closest(".item").classList.add("tobedeleted")
		document.querySelector("#trash").appendChild(e.target.closest(".item"))
	}, 2000)
	console.log(timer)
}

function mouseUp(e){
	if (timer){
		window.clearTimeout(timer)
		//e.target.closest(".item").classList.remove("tobedeleted")
	}
};



function createListItem(text, details){
	var item = document.createElement("div")
	item.classList.add("item")
	item.addEventListener("mousedown", mouseDown)

	var img = document.createElement("img")
	img.src = "images/apple.svg"
	item.appendChild(img)

	var textelement = document.createElement("p")
	textelement.innerHTML = text
	textelement.classList.add("name")
	item.appendChild(textelement)

	if(details != undefined){
		var textelement = document.createElement("p")
		textelement.innerHTML = 
		textelement.classList.add("details")
		item.appendChild(textelement)
	}
	
	return item
}

async function queryServerForImage(name){
	port = 8080
	const url = "localhost:${port}/icon/${name}.svg"
	const content = fetch(url, {method:"GET"}).then(x => {return x.body})
	return content
}

function search(){
	//const image = queryServerForImage("banana")

	var node = document.querySelector('input[name="name"]')
	var name = node.value
	if (name.length <= 0) {
		return
	}
	node.value = ""

	node = document.querySelector('input[name="details"]')
	var details = node.value
	node.value = ""
	var child = createListItem(name, details)
	results.appendChild(child)
}

function clearHistory() {
	var node = document.querySelector("div#history")
	while(node.firstChild){
		node.firstChild.remove()
	}
}

/* * * *
	Storage - Cache 
* * * */

var storage = window.localStorage

document.addEventListener("DOMContentLoaded", ()=>{
	populateFromStorage()
	document.body.addEventListener("mouseup", mouseUp);
});

function populateFromStorage(){
	selectedItems = JSON.parse(storage.getItem("selectedItems"))
	historyItems  = JSON.parse(storage.getItem("historyItems"))
	
	for(let item of selectedItems){
		document.getElementById("selected").appendChild(createListItem(item))
	}

	for(let item of historyItems){
		document.getElementById("history").appendChild(createListItem(item))
	}
	
}

function persistToStorage(){
	var sel= []
	for (let child of document.getElementById("selected").children){
		sel.push(child.querySelector("p").innerText)
	}

	var his = []
	for (let child of document.getElementById("history").children){
		his.push(child.querySelector("p").innerText)
	}

	storage.setItem("selectedItems", JSON.stringify(sel))
	storage.setItem("historyItems", JSON.stringify(his))
	return storage
}

window.onunload = persistToStorage

