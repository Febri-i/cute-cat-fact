const gap = 30;
const speed = 1;

let lastTime = 0;

function scrollTheShit(timestamp) {
	const delta = (timestamp - lastTime) / 10;
	lastTime = timestamp;

	const factsContainers = document.querySelectorAll(".factsContainer");
	factsContainers.forEach((factsContainer) => {
		if (!parseInt(factsContainer.dataset.playing)) {
			return;
		}
		const facts = [...factsContainer.children];

		let offset =
			parseFloat(factsContainer.dataset.offset) + delta * parseFloat(factsContainer.dataset.speed);

		const wayDown = [];

		if (offset > factsContainer.offsetHeight) {
			for (let i = 0; i < facts.length; i++) {
				const initialTop = parseFloat(facts[i].dataset.initialTop);
				const top = initialTop + offset;
				facts[i].dataset.initialTop = top;
			}
			offset = 0;
		}

		factsContainer.dataset.offset = offset;

		let topElemenetHeight = Infinity;

		for (let i = 0; i < facts.length; i++) {
			const initialTop = parseFloat(facts[i].dataset.initialTop);
			const top = initialTop + offset;

			if (top < topElemenetHeight) {
				topElemenetHeight = initialTop;
			}

			facts[i].style.top = top + "px";

			if (top > factsContainer.offsetHeight + facts[i].offsetHeight / 2) {
				wayDown.push(facts[i]);
			}
		}

		for (let i = 0; i < wayDown.length; i++) {
			const localInitialTop = (wayDown[i].offsetHeight + gap) * (i + 1);
			const globalInitialTop = topElemenetHeight - localInitialTop - gap;
			wayDown[i].dataset.initialTop = globalInitialTop;
			queryFact().then((fact) => (wayDown[i].children[1].textContent = fact));
			queryImage().then((image) => {
				wayDown[i].children[0].dataset.img = image;
				wayDown[i].children[0].style.background = `url(${image})`;
			});
		}
	});

	return window.requestAnimationFrame(scrollTheShit);
}

function queryFact() {
	return new Promise((resolve, reject) => {
		fetch("https://catfact.ninja/fact")
			.then((res) => res.json())
			.then((fact) => resolve(fact.fact))
			.catch(reject);
	});
}

function queryImage() {
	return new Promise((resolve, reject) => {
		fetch("https://cataas.com/cat", {
			cache: "no-cache",
		})
			.then((res) => res.blob())
			.then((imageBlob) => {
				const fileReader = new FileReader();
				fileReader.onloadend = (ev) => {
					resolve(fileReader.result);
				};

				fileReader.readAsDataURL(imageBlob);
			})
			.catch(reject);
	});
}

function downloadCat(url) {
	const a = document.createElement("a");
	a.download = "Cute cat.";
	a.href = url;
	a.click();
}

async function copyFact(fact) {
	try {
		await navigator.clipboard.writeText(fact);
		alert("Fact copied!");
	} catch (err) {
		alert("Failed to copy fact!");
	}
}

function createFact(parent, initialTop) {
	const container = document.createElement("div");
	container.classList.add("catFact");

	const img = document.createElement("div");

	const factText = document.createElement("span");

	queryFact().then((fact) => (factText.textContent = fact));
	queryImage().then((image) => {
		img.dataset.img = image;
		img.style.background = `url(${image})`;
	});

	img.onclick = (e) => {
		if (img.dataset.img) {
			downloadCat(img.dataset.img);
		}
	};

	factText.onclick = (e) => {
		if (factText.textContent.length) {
			copyFact(factText.textContent);
		}
	};

	container.style.top = initialTop + "px";
	container.dataset.initialTop = initialTop;

	container.addEventListener("mouseenter", (e) => {
		parent.dataset.playing = 0;
	});

	container.addEventListener("mouseleave", (e) => {
		parent.dataset.playing = 1;
	});

	container.appendChild(img);
	container.appendChild(factText);

	return container;
}

function generateFacts(id, factGap = 30, maxspeed = 1) {
	const totalFact = 6;

	const factsBowl = document.getElementById(id);

	const factRatio = 4 / 6;
	const factHeight = factsBowl.offsetHeight * ((totalFact - 2) / totalFact);
	const factWidth = factRatio * factHeight;

	const totalFactContainer = Math.ceil(factsBowl.offsetWidth / (factWidth + factGap));

	factsBowl.style.gridTemplateColumns = `repeat(${totalFactContainer}, 1fr)`;

	factsBowl.innerHTML = "";

	for (let i = 0; i < totalFactContainer; i++) {
		const offset = (factHeight / totalFact) * i;
		const speed = Math.random() * (maxspeed * 0.75) + maxspeed * 0.25;
		const factsContainer = document.createElement("div");
		factsContainer.dataset.offset = offset;
		factsContainer.dataset.speed = speed;
		factsContainer.classList.add("factsContainer");
		factsContainer.dataset.playing = 1;

		for (let j = 0; j < totalFact; j++) {
			const fact = createFact(factsContainer, (factHeight + factGap) * (j - 1) + offset);
			factsContainer.appendChild(fact);
			fact.style.height = factHeight + "px";
		}

		factsBowl.appendChild(factsContainer);
	}
}

generateFacts("facts", gap, speed);
window.addEventListener("resize", () => generateFacts("facts", gap, speed));
window.requestAnimationFrame((timestamp) => {
	lastTime = timestamp;
	scrollTheShit(timestamp);
});
