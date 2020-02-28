<template>
<div>
    <h2>OpenBMC Color Palette</h2>
    <div v-for="item in colors">
        <h3>{{ item.color}}</h3>
        <div class="color-tile-container">
            <div v-for="shade in item.shades">
                <div :style="{ backgroundColor: shade.hex }" :class="{ 'color-tile--border': shade.border}" class="color-tile"></div>
                <dl class="color-tile-desc">
                    <dt>Color variable:</dt>
                    <dd>${{ shade.variable }}</dd>
                </dl>
                <dl class="color-tile-desc">
                    <dt>Hex:</dt>
                    <dd>{{ shade.hex }}</dd>
                </dl>
            </div>
        </div>
    </div>
    <h2>Base Colors</h2>
    <p>Colors that are established in the Bootstrap component library. These are overridden using the colors in the OpenBMC color palette.</p>
    <div class="color-tile-container">
        <div v-for="item in baseColors">
            <div :style="{ backgroundColor: item.hex }" :class="{ 'color-tile--border': item.border}" class="color-tile"></div>
            <dl class="color-tile-desc">
                <dt>Color variable:</dt>
                <dd>${{ item.name }}</dd>
            </dl>
            <dl class="color-tile-desc">
                <dt>Color token:</dt>
                <dd>${{ item.variable }}</dd>
            </dl>
        </div>
    </div>
    <h2>Theme Colors</h2>
    <p>Colors that are established in the Bootstrap component library. These are overridden using the colors in the OpenBMC color palette.</p>
    <div class="color-tile-container">
        <div v-for="item in themeColors">
            <div :style="{ backgroundColor: item.hex }" :class="{ 'color-tile--border': item.border}" class="color-tile"></div>
            <dl class="color-tile-desc">
                <dt>Color variable:</dt>
                <dd>${{ item.name }}</dd>
            </dl>
            <dl class="color-tile-desc">
                <dt>Color variable:</dt>
                <dd>${{ item.variable }}</dd>
            </dl>
        </div>
    </div>
</div>
</template>

<script>
export default {
    data() {
        return {
            colors: [
                {
                    color: "Black",
                    shades: [
                        {
                            "variable": "black",
                            "hex": "#000000"
                        }
                    ]
                },
                {
                    color: "Blue",
                    shades: [
                        {
                            "variable": "blue-100",
                            "hex": "#eff2fb"
                        },
                        // {
                        //     "variable": "blue-200",
                        //     "hex": "#ccd7f4"
                        // },
                        // {
                        //     "variable": "blue-300",
                        //     "hex": "#7295f1"
                        // },
                        {
                            "variable": "blue-400",
                            "hex": "#2d60e5"
                        },
                        // {
                        //     "variable": "blue-500",
                        //     "hex": "#1d3458"
                        // },
                        {
                            "variable": "blue-900",
                            "hex": "#1b2834"
                        }
                    ]
                },
                {
                    "color": "Gray",
                    "shades": [
                        {
                            "variable": "gray-100",
                            "hex": "#fafafa",
                            "border": true
                        },
                        {
                            "variable": "gray-200",
                            "hex": "#ebebeb"
                        },
                        {
                            "variable": "gray-300",
                            "hex": "#dbdbdb"
                        },
                        {
                            "variable": "gray-400",
                            "hex": "#cccccc"
                        },
                        {
                            "variable": "gray-500",
                            "hex": "#a8a8a8"
                        },
                        {
                            "variable": "gray-600",
                            "hex": "#838383"
                        },
                        {
                            "variable": "gray-700",
                            "hex": "#5f5f5f"
                        },
                        {
                            "variable": "gray-800",
                            "hex": "#3a3a3a"
                        },
                        {
                            "variable": "gray-900",
                            "hex": "#161616"
                        },
                    ]
                },
                {
                    "color": "Green",
                    "shades": [
                        // {
                        //     "variable": "green-100",
                        //     "hex": "#ecfdf1"
                        // },
                        // {
                        //     "variable": "green-200",
                        //     "hex": "#c6e8c5"
                        // },
                        {
                            "variable": "green",
                            "hex": "#0a7d06"
                        },
                    ]
                },
                {
                    "color": "Orange",
                    "shades": [
                        {
                            "variable": "orange",
                            "hex": "#d87c00"
                        }
                    ]
                },
                {
                    "color": "Red",
                    "shades": [
                        // {
                        //     "variable": "red-100",
                        //     "hex": "#feeeed"
                        // },
                        // {
                        //     "variable": "red-200",
                        //     "hex": "#ffdedd"
                        // },
                        // {
                        //     "variable": "red-300",
                        //     "hex": "#ffbcbc"
                        // },
                        // {
                        //     "variable": "red-400",
                        //     "hex": "#ff7878"
                        // },
                        {
                            "variable": "red",
                            "hex": "#da1416"
                        }
                    ]
                },
                {
                    "color": "Teal",
                    "shades": [
                        // {
                        //     "variable": "teal-200",
                        //     "hex": "#ccf0f5"
                        // },
                        {
                            "variable": "teal",
                            "hex": "#00b6cb"
                        },
                        // {
                        //     "variable": "teal-700",
                        //     "hex": "#098292"
                        // }
                    ]
                },
                {
                    "color": "White",
                    "shades": [
                        {
                            "variable": "white",
                            "hex": "#ffffff",
                            "border": true
                        }
                    ]
                },
                {
                    "color": "Yellow",
                    "shades": [
                        // {
                        //     "variable": "yellow-100",
                        //     "hex": "#fff8e4"
                        // },
                        // {
                        //     "variable": "yellow-200",
                        //     "hex": "#fffcbf"
                        // },
                        // {
                        //     "variable": "yellow-300",
                        //     "hex": "#ffdf99"
                        // },
                        {
                            "variable": "yellow",
                            "hex": "#fedf39"
                        },
                        // {
                        //     "variable": "yellow-700",
                        //     "hex": "#efc100"
                        // }
                    ]
                }
            ],
            baseColors: [
                {
                    "name": "blue",
                    "variable": "blue-400",
                    "hex": "#2d60e5"
                },
                {
                    "name": "gray",
                    "variable": "gray-400",
                    "hex": "#ccc"
                },
                {
                    "name": "green",
                    "variable": "green-500",
                    "hex": "#0a7d06"
                },
                {
                    "name": "red",
                    "variable": "red-500",
                    "hex": "#da1416"
                },
                {
                    "name": "teal",
                    "variable": "teal-500",
                    "hex": "#098292"
                },
                {
                    "name": "yellow",
                    "variable": "yellow-500",
                    "hex": "#fedf39"
                }
            ],
            themeColors: [
                {
                    "name": "primary",
                    "variable": "blue",
                    "hex": "#2d60e5"
                },
                // {
                //     "name": "primary-dark",
                //     "variable": "blue-900",
                //     "hex": "#1b2834"
                // },
                // {
                //     "name": "primary Light",
                //     "variable": "blue-100",
                //     "hex": "#eff2fb"
                // },
                {
                    "name": "secondary",
                    "variable": "gray-600",
                    "hex": "#999"
                },
                // {
                //     "name": "secondary-dark",
                //     "variable": "gray-800",
                //     "hex": "#333"
                // },
                // {
                //     "name": "secondary-light",
                //     "variable": "gray-200",
                //     "hex": "#f4f4f4"
                // },
                {
                    "name": "dark",
                    "variable": "gray-900",
                    "hex": "#161616"
                },
                {
                    "name": "light",
                    "variable": "gray-100",
                    "hex": "#fafafa",
                    "border": true
                },
                {
                    "name": "info",
                    "variable": "teal",
                    "hex": "#098292"
                },
                {
                    "name": "success",
                    "variable": "green",
                    "hex": "#0a7d06"
                },
                {
                    "name": "warning",
                    "variable": "yellow",
                    "hex": "#fedf39"
                },
                {
                    "name": "danger",
                    "variable": "red",
                    "hex": "#da1416"
                },
            ]
        }
    }
}
</script>

<style scoped lang="scss">
    .color-tile-container {
        display: grid;
        grid-gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    }

    .color-tile {
        display: block;
        width: 220px;
        height: 140px;

        &--border {
            border: 1px dashed #ccc;
        }
    }

    .color-tile-desc {
        margin: .5rem 0;
    }

     .color-tile-desc dt {
         display: inline;
         font-weight: bold;
    }

     .color-tile-desc dd {
         display: inline;
         margin: 0;
    }
</style>