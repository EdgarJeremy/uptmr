import _ from 'lodash';

class SAW {
    breakage;
    availability;
    warranty;
    usability;
    models;
    standards = {
        breakage: 0.3,
        availability: 0.3,
        warranty: 0.1,
        usability: 0.3
    }

    constructor(models, breakage, availability, warranty, usability) {
        this.models = models;
        this.breakage = breakage;
        this.availability = availability;
        this.warranty = warranty;
        this.usability = usability;
    }

    async getAlternatives() {
        const rawAlternatives = await this.models.Report.collection({
            attributes: ['questionnaire']
        });
        const alternatives = rawAlternatives.rows.map((a) => {
            return {
                __instance: a,
                ...a.questionnaire
            }
        });
        alternatives.push({
            breakage: this.breakage,
            availability: this.availability,
            warranty: this.warranty,
            usability: this.usability
        });
        return alternatives;
    }

    async calculate() {
        const standards = this.standards;
        const alternatives = await this.getAlternatives();
        console.log(alternatives);
        // cost criterias
        const minBreakage = _.minBy(alternatives, 'breakage').breakage;
        const minAvailability = _.minBy(alternatives, 'availability').availability;
        const minWarranty = _.minBy(alternatives, 'warranty').warranty;
        // benefits criteria
        const maxUsability = _.maxBy(alternatives, 'usability').usability;
        const normalized = alternatives.map((a) => {
            return {
                __instance: a.__instance,
                breakage: minBreakage / a.breakage,
                availability: minAvailability / a.availability,
                warranty: minWarranty / a.warranty,
                usability: a.usability / maxUsability
            }
        });
        console.log('alternatives', alternatives);
        console.log('minBreakage', minBreakage);
        console.log('minAvailability', minAvailability);
        console.log('minWarranty', minWarranty);
        console.log('maxUsability', maxUsability);
        console.log('alternatives', alternatives);
        console.log('normalized', normalized);
        const final = normalized.map((n) => {
            return {
                __instance: n.__instance,
                urgency: (n.breakage * standards.breakage) + (n.availability * standards.availability) + (n.warranty * standards.warranty) + (n.usability * standards.usability)
            }
        });
        const newlyCreated = final.splice(final.length - 1, 1);
        final.forEach(async (f) => {
            console.log('updating before');
            await f.__instance.update({ urgency: f.urgency });
        });
        return newlyCreated[0].urgency;
    }
}

export default SAW;