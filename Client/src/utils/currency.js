function convertToGold(quantity, currencyCode) {
    switch (currencyCode) {
        case "cp":
            return quantity * 0.01

        case "sp":
            return quantity * 0.1

        case "ep":
            return quantity * 0.5

        case "gp":
            return quantity

        case "pp":
            return quantity * 10

        default:
            return 0
    }
}

export { convertToGold }