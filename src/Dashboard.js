import React, { Component } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import clsx from "clsx";
import { withStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Box from "@material-ui/core/Box";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Link from "@material-ui/core/Link";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import NotificationsIcon from "@material-ui/icons/Notifications";
import { teal, pink } from "@material-ui/core/colors";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { mainListItems, secondaryListItems } from "./listItems";
import Orders from "./Orders";
import MostSalesProduct from "./MostSalesProduct";

const drawerWidth = 240;

const styles = (theme) => ({
    root: {
        display: "flex",
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 8px",
        ...theme.mixins.toolbar,
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: 36,
    },
    menuButtonHidden: {
        display: "none",
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: {
        position: "relative",
        whiteSpace: "nowrap",
        width: drawerWidth,
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: "hidden",
        transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up("sm")]: {
            width: theme.spacing(9),
        },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
        height: "100vh",
        overflow: "auto",
    },
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
    },
    paper: {
        padding: theme.spacing(2),
        display: "flex",
        overflow: "auto",
        flexDirection: "column",
    },
    fixedHeight: {
        height: 240,
    },
});

const themePDB = createMuiTheme({
    palette: {
        primary: teal,
        secondary: pink,
    },
});

const chart1Socket = new WebSocket(
    "ws://" + window.location.hostname + ":8000" + "/visualization/"
);
const chart2Socket = new WebSocket(
    "ws://" + window.location.hostname + ":8000" + "/visualization/"
);
const recentRatingsSocket = new WebSocket(
    "ws://" + window.location.hostname + ":8000" + "/visualization/"
);

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: true,
            recentRatings: [],
        };
    }

    componentWillMount() {
        fetch("http://localhost:8000/");

        chart1Socket.onopen = () => {
            console.log("Chart 1 WebSocket Client Connected");
        };
        chart2Socket.onopen = () => {
            console.log("Chart 2 WebSocket Client Connected");
        };
        recentRatingsSocket.onopen = () => {
            console.log("Recent Ratings WebSocket Client Connected");
        };

        recentRatingsSocket.onmessage = (message) => {
            const data = JSON.parse(message.data);
            console.log("recent ratings socket message received");

            if (data.type === "rating") {
                const { recentRatings } = this.state;
                if (recentRatings.length >= 5) {
                    recentRatings.shift();
                }
                recentRatings.push(data.message.after);
                this.setState({
                    recentRatings: recentRatings,
                });
            }
        };
    }

    componentWillUnmount() {
        chart1Socket.close();
        chart2Socket.close();
        recentRatingsSocket.close();
    }

    handleDrawerOpen = () => {
        this.setState({
            open: true,
        });
    };

    handleDrawerClose = () => {
        this.setState({
            open: false,
        });
    };

    render() {
        const { classes } = this.props;
        const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

        const copyright = (
            <Typography variant="body2" color="textSecondary" align="center">
                {"Templates from  "}
                <Link color="inherit" href="https://material-ui.com/">
                    Material UI
                </Link>
                {"."}
            </Typography>
        );

        const copyrightPDB = (
            <Typography variant="body2" color="textSecondary" align="center">
                {"Dibuat untuk nilai yang lebih baik oleh "}
                <Link
                    color="inherit"
                    href="https://github.com/farril-zavier/pdb-kafka-frontend-react"
                >
                    Kelompok 11 PDB
                </Link>{" "}
                {new Date().getFullYear()}
                {"."}
            </Typography>
        );

        const chart1Options = {
            chart: {
                events: {
                    load: function () {
                        const series = this.series[0];
                        var x, y;
                        chart1Socket.onmessage = (message) => {
                            console.log("chart 1 socket message received");
                            const data = JSON.parse(message.data);
                            console.log(data);

                            if (data.type === "average_rating") {
                                x = new Date(data.message.timestamp).getTime();
                                y = data.message.average_rating;
                                const shift = series.data.length > 100;
                                series.addPoint([x, y], true, shift);
                            }
                        };
                    },
                },
            },
            time: {
                useUTC: false,
            },
            rangeSelector: {
                buttons: [
                    {
                        count: 1,
                        type: "second",
                        text: "1S",
                    },
                    {
                        count: 5,
                        type: "second",
                        text: "5S",
                    },
                    {
                        count: 10,
                        type: "second",
                        text: "10S",
                    },
                    {
                        count: 25,
                        type: "second",
                        text: "25S",
                    },
                    {
                        count: 50,
                        type: "second",
                        text: "50S",
                    },
                    {
                        type: "all",
                        text: "All",
                    },
                ],
                inputEnabled: false,
                selected: 5,
            },
            title: {
                text: "Total Average Product Rating",
            },
            yAxis: {
                title: {
                    text: "Average Rating",
                },
            },
            xAxis: {
                title: {
                    text: "Timestamp",
                },
            },
            series: [
                {
                    name: "Average Product Rating",
                    data: [],
                },
            ],
        };

        const chart2Options = {
            title: {
                text: "Solar Employment Growth by Sector, 2010-2016",
            },
            yAxis: {
                title: {
                    text: "Number of Employees",
                },
            },
            xAxis: {
                accessibility: {
                    rangeDescription: "Range: 2010 to 2017",
                },
            },
            legend: {
                layout: "vertical",
                align: "right",
                verticalAlign: "middle",
            },
            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false,
                    },
                    pointStart: 2010,
                },
            },
            series: [
                {
                    name: "Installation",
                    data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175],
                },
                {
                    name: "Manufacturing",
                    data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434],
                },
                {
                    name: "Sales & Distribution",
                    data: [11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387],
                },
                {
                    name: "Project Development",
                    data: [null, null, 7988, 12169, 15112, 22452, 34400, 34227],
                },
                {
                    name: "Other",
                    data: [12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111],
                },
            ],
            responsive: {
                rules: [
                    {
                        condition: {
                            maxWidth: 500,
                        },
                        chartOptions: {
                            legend: {
                                layout: "horizontal",
                                align: "center",
                                verticalAlign: "bottom",
                            },
                        },
                    },
                ],
            },
        };

        return (
            <div className={classes.root}>
                <ThemeProvider theme={themePDB}>
                    <CssBaseline />
                    <AppBar
                        position="absolute"
                        className={clsx(classes.appBar, this.state.open && classes.appBarShift)}
                    >
                        <Toolbar className={classes.toolbar}>
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="open drawer"
                                onClick={this.handleDrawerOpen}
                                className={clsx(
                                    classes.menuButton,
                                    this.state.open && classes.menuButtonHidden
                                )}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography
                                component="h1"
                                variant="h6"
                                color="inherit"
                                noWrap
                                className={classes.title}
                            >
                                Live E-Commerce Dashboard using Kafka and Debezium
                            </Typography>
                            <IconButton color="inherit">
                                <Badge badgeContent={11} color="secondary">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Toolbar>
                    </AppBar>
                    <Drawer
                        variant="permanent"
                        classes={{
                            paper: clsx(
                                classes.drawerPaper,
                                !this.state.open && classes.drawerPaperClose
                            ),
                        }}
                        open={this.state.open}
                    >
                        <div className={classes.toolbarIcon}>
                            <IconButton onClick={this.handleDrawerClose}>
                                <ChevronLeftIcon />
                            </IconButton>
                        </div>
                        <Divider />
                        <List>{mainListItems}</List>
                        <Divider />
                        <List>{secondaryListItems}</List>
                    </Drawer>
                    <main className={classes.content}>
                        <div className={classes.appBarSpacer} />
                        <Container maxWidth="lg" className={classes.container}>
                            <Grid container spacing={3}>
                                {/* Most Sales Product */}
                                <Grid item xs={12} md={4} lg={6}>
                                    <Paper className={classes.paper}>
                                        <MostSalesProduct />
                                    </Paper>
                                </Grid>
                                <Grid item xs={12} md={4} lg={6}></Grid>
                                {/* Line Chart 1 */}
                                <Grid item xs={12} md={4} lg={6}>
                                    <Paper className={classes.paper}>
                                        <HighchartsReact
                                            constructorType={"stockChart"}
                                            highcharts={Highcharts}
                                            options={chart1Options}
                                        />
                                    </Paper>
                                </Grid>
                                {/* Line Chart 2 */}
                                <Grid item xs={12} md={4} lg={6}>
                                    <Paper className={classes.paper}>
                                        <HighchartsReact
                                            highcharts={Highcharts}
                                            options={chart2Options}
                                        />
                                    </Paper>
                                </Grid>
                                {/* Recent Orders */}
                                <Grid item xs={12}>
                                    <Paper className={classes.paper}>
                                        <Orders />
                                    </Paper>
                                </Grid>
                            </Grid>
                            <Box pt={4}>
                                {copyrightPDB}
                                {copyright}
                            </Box>
                        </Container>
                    </main>
                </ThemeProvider>
            </div>
        );
    }
}

export default withStyles(styles, { withTheme: true })(Dashboard);
