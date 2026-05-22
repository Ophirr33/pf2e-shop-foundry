"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopDataModel = void 0;
const { TypeDataModel, fields } = foundry.data;
const { StringField, HTMLField } = fields;
class ShopDataModel extends TypeDataModel {
    static defineSchema() {
        return {
            description: new HTMLField({ required: false, initial: "" }),
            shopkeeperName: new StringField({ required: false, initial: "" }),
        };
    }
}
exports.ShopDataModel = ShopDataModel;
//# sourceMappingURL=shop-model.js.map