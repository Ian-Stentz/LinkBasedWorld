class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title);
        this.engine.addChoice("Begin the story");
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData["InitialLocation"]);
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key];
        if(locationData["AltBody"] != undefined  && this.altCondition(locationData.AltBody.Condition)) {
            this.engine.show(locationData.AltBody.Text);
        } else {
            this.engine.show(locationData.Body);
        }
        this.handleItems(locationData);

        if(locationData.Choices !== undefined) {
            for(let choice of locationData.Choices) {
                if(choice.Conditions == undefined || this.conditionSatisfied(choice.Conditions)) {
                    this.engine.addChoice(choice.Text, choice);
                }
            }
        } else {
            this.engine.addChoice("The end.")
        }

        this.handleTags(locationData);
    }

    altCondition(condition) {
        switch (condition) {
            case "SR Visited":
                return this.engine.player.checkTag("SR Visited");
            case "Starch Collected":
                return this.engine.player.getItemAmount("starch") >= 1;
            case "Office? Visited":
                return this.engine.player.checkTag("Office? Visited");
            default:
                console.log("Unknown alt body condition");
                return false;
        }
    }

    conditionSatisfied(conditions) {
        for (let condition of conditions) {
            if(!this.checkCondition(condition)) {
                return false;
            }
        }
        return true;
    }

    checkCondition(condition) {
        switch(condition) {
            case "Have Mirrors":
                return this.engine.player.getItemAmount("mirrora") >= 1 && this.engine.player.getItemAmount("mirrorb") >= 1;
            case "Know Mirrors":
                return this.engine.player.checkTag("Know Mirrors");
            case "No Mirror A":
                return this.engine.player.getItemAmount("mirrora") == 0;
            case "No Mirror B":
                return this.engine.player.getItemAmount("mirrorb") == 0;
            case "Starchless Condition":
                //console.log(this.engine.player.getItemAmount("starch"));
                return this.engine.player.getItemAmount("starch") == 0;
            default:
                console.log("Unknown condition");
                return;        
        }
    }

    handleItems(locationData) {
        if(locationData.Items != undefined) {
            for(let item of locationData["Items"]) {
                this.engine.player.addItem(item.Name, item.Amount);
            }
        }
    }

    handleTags(locationData) {
        if(locationData.Tags != undefined) {
            for(let tag of locationData.Tags) {
                this.engine.player.addTag(tag);
            }
        }
    }

    handleChoice(choice) {
        if(choice) {
            this.engine.show("&gt; "+choice.Text);

            //Selects Class based on choice tag
            // This (below) is bad practice and I should move things around. However, I am currently using it for only 1 thing and I am on a bit of a time limit so I'd rather not do it. Thanks.
            switch (choice["Type"]) {
                case "RandomExit":
                    this.engine.gotoScene(RandomExitLoc, choice.Target);
                    break;
                case "Dialogue":
                    this.engine.gotoScene(Dialogue, choice.Target);
                    break;
                default:
                    this.engine.gotoScene(Location, choice.Target);
            }

        } else {
            this.engine.gotoScene(End);
        }
    }
}

class RandomExitLoc extends Location {
    handleChoice(choice) {
        //if choice has multiple targets, use same text for button but redirect to random choice
        if(choice && choice.Targets != undefined) {
            let choiceAmount = choice.Targets.length;
            let choiceIndex = Math.floor(Math.random() * choiceAmount);
            this.engine.show("&gt; "+choice.Text);

            // This (below) is bad practice and I should move things around. However, I am currently using it for only 1 thing and I am on a bit of a time limit so I'd rather not do it. Thanks.
            switch (choice["Type"]) {
                case "RandomExit":
                    this.engine.gotoScene(RandomExitLoc, choice.Targets[choiceIndex]);
                    break;
                case "Dialogue":
                    this.engine.gotoScene(Dialogue, choice.Target);
                    break;
                default:
                    this.engine.gotoScene(Location, choice.Targets[choiceIndex]);
            }

        } else if(choice) {
            this.engine.show("&gt; "+choice.Text);

            // This (below) is bad practice and I should move things around. However, I am currently using it for only 1 thing and I am on a bit of a time limit so I'd rather not do it. Thanks.
            switch (choice["Type"]) {
                case "RandomExit":
                    this.engine.goToScene(RandomExitLoc, choice.Target);
                    break;
                default:
                    this.engine.gotoScene(Location, choice.Target);
            }

        } else {
            this.engine.gotoScene(End);
        }
    }
}

class Dialogue extends Location {
    create(key, character) {
        let locationData
        if(character == undefined) {
            let initialLocation = this.engine.storyData.Dialogue[key]["InitialNode"];
            locationData = this.engine.storyData.Dialogue[key][initialLocation];
            this.curChar = key;
        } else {
            locationData = this.engine.storyData.Dialogue[character][key];
            this.curChar = character;
        }

        if(locationData["AltBody"] != undefined && this.altCondition(locationData.AltBody.Condition)) {
            this.engine.show(locationData.AltBody.Text);
        } else {
            this.engine.show(locationData.Body);
        }
        this.handleItems(locationData);

        if(locationData.Choices !== undefined) {
            for(let choice of locationData.Choices) {
                if(choice.Conditions == undefined || this.conditionSatisfied(choice.Conditions)) {
                    this.engine.addChoice(choice.Text, choice);
                }
            }
        } else {
            this.engine.addChoice("The end.")
        }

        this.handleTags(locationData);
    }

    handleChoice(choice) {
        if(choice) {
            this.engine.show("&gt; "+choice.Text);

            //Selects Class based on choice tag
            // This (below) is bad practice and I should move things around. However, I am currently using it for only 1 thing and I am on a bit of a time limit so I'd rather not do it. Thanks.
            switch (choice["Type"]) {
                case "RandomExit":
                    this.engine.gotoScene(RandomExitLoc, choice.Target);
                    break;
                case "Location":
                    this.engine.gotoScene(Location, choice.Target);
                    break;
                default:
                    console.log("beep");
                    this.engine.gotoScene(Dialogue, choice.Target, this.curChar);
            }

        } else {
            this.engine.gotoScene(End);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');