
export const getKeywordColor = (index: number): string => {
    const colors = [
        "#FF6F61",
        "#6B5B95",
        "#88B04B",
        "#F7CAC9",
        "#92A8D1",
        "#955251",
        "#B565A7",
        "#009B77",
        "#DD4124",
        "#D65076",
        "#45B8AC",
        "#EFC050",
        "#5B5EA6",
    ];

    return colors[index % colors.length];
};
