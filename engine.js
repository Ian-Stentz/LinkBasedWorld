class Engine {

    static load(...args) {
        window.onload = () => new Engine(...args);
    }

    constructor(firstSceneClass, storyDataUrl) {

        this.firstSceneClass = firstSceneClass;
        this.storyDataUrl = storyDataUrl;

        this.header = document.body.appendChild(document.createElement("h1"));
        this.output = document.body.appendChild(document.createElement("div"));
        this.actionsContainer = document.body.appendChild(document.createElement("div"));

        this.player = new Player(this);

        fetch(storyDataUrl).then(
            (response) => response.json()
        ).then(
            (json) => {
                this.storyData = json;
                this.gotoScene(firstSceneClass)
            }
        );
    }

    gotoScene(sceneClass, data) {
        this.scene = new sceneClass(this);
        this.scene.create(data);
    }

    addChoice(action, data) {
        let button = this.actionsContainer.appendChild(document.createElement("button"));
        button.innerText = action;
        button.onclick = () => {
            while(this.actionsContainer.firstChild) {
                this.actionsContainer.removeChild(this.actionsContainer.firstChild)
            }
            this.scene.handleChoice(data);
        }
    }

    setTitle(title) {
        document.title = title;
        this.header.innerText = title;
    }

    show(msg) {
        let div = document.createElement("div");
        div.innerHTML = msg;
        this.output.appendChild(div);
    }
}

class Scene {
    constructor(engine) {
        this.engine = engine;
    }

    create() { }

    update() { }

    handleChoice(action) {
        console.warn('no choice handler on scene ', this);
    }
}

class Player {
    constructor(engine) {
        this.engine = engine;
        this.inventory = {};
        this.tags = [];
    }

    addItem(item, amount) {
        if(this.inventory[item] == undefined) {
            this.inventory[item] = amount;
            console.log(this.inventory[item]);
        }
        else {
            this.inventory[item] += amount;
            console.log(`${item}: ${this.inventory[item]}`);
        }
    }

    getItemAmount(item) {
        if (this.inventory[item] != undefined) {
            console.log(`${item}: ${this.inventory[item]}`);
            return this.inventory[item];
        }
        else {
            console.log(`No items of ${item}`)
            return 0;
        }
    }

    addTag(tag) {
        this.tags.push(tag);
    }

    checkTag(tag) {
        return this.tags.includes(tag);
    }
}