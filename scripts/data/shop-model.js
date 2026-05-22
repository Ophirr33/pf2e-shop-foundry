const { TypeDataModel, fields } = foundry.data;
const { StringField, HTMLField } = fields;
export class ShopDataModel extends TypeDataModel {
    static defineSchema() {
        return {
            description: new HTMLField({ required: false, initial: "" }),
            shopkeeperName: new StringField({ required: false, initial: "" }),
        };
    }
}
//# sourceMappingURL=shop-model.js.map