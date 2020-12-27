import React, { Component } from "react";
import Highcharts from "highcharts";
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
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Fade from "@material-ui/core/Fade";
import Title from "./Title";
import { teal, pink } from "@material-ui/core/colors";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { mainListItems, secondaryListItems } from "./listItems";
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
    seeMore: {
        marginTop: theme.spacing(3),
    },
});

const themePDB = createMuiTheme({
    palette: {
        primary: teal,
        secondary: pink,
    },
});

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const socket = new WebSocket("ws://" + window.location.hostname + ":8000" + "/visualization/");

class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            open: true,
            recentReviews: [],
            newestReview: {},
            newestAverageRating: {},
            newestAverageAge: {},

            chart1Options: {
                title: {
                    text: "Total Average Product Rating",
                },
                chart: {
                    type: "line",
                },
                yAxis: {
                    title: {
                        text: "Rating",
                    },
                    min: 0,
                    max: 5,
                },
                xAxis: {
                    title: {
                        text: "Timestamp",
                    },
                    categories: [],
                },
                series: [
                    {
                        name: "Average Rating",
                        data: [],
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
            },

            chart2Options: {
                title: {
                    text: "Average Customer Age",
                },
                chart: {
                    type: "line",
                },
                yAxis: {
                    title: {
                        text: "Age",
                    },
                    min: 0,
                    max: 100,
                },
                xAxis: {
                    title: {
                        text: "Timestamp",
                    },
                    categories: [],
                },
                series: [
                    {
                        name: "Average Age",
                        data: [],
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
            },
        };
    }

    componentDidMount() {
        fetch("http://localhost:8000/");

        socket.onopen = () => {
            console.log("WebSocket Client Connected");
        };
        socket.onmessage = (message) => {
            const data = JSON.parse(message.data);
            console.log(data);

            if (data.type === "rating") {
                const newestReview = data.message.after;
                newestReview.show = true;
                this.setState(
                    {
                        newestReview: newestReview,
                    },
                    () => {
                        const { recentReviews } = this.state;
                        if (recentReviews.length >= 5) {
                            recentReviews[0].show = false;
                            this.setState(
                                {
                                    recentReviews: recentReviews,
                                },
                                () => {
                                    setTimeout(() => {
                                        const { recentReviews } = this.state;
                                        recentReviews.shift();
                                        this.setState(
                                            {
                                                recentReviews: recentReviews,
                                            },
                                            () => {
                                                setTimeout(() => {
                                                    const { recentReviews } = this.state;
                                                    recentReviews.push(newestReview);
                                                    this.setState({
                                                        recentReviews: recentReviews,
                                                    });
                                                }, 500);
                                            }
                                        );
                                    }, 300);
                                }
                            );
                        } else {
                            recentReviews.push(newestReview);
                            this.setState({
                                recentReviews: recentReviews,
                            });
                        }
                    }
                );
            } else if (data.type === "average_rating") {
                this.setState(
                    {
                        newestAverageRating: data.message,
                    },
                    () => {
                        const { categories } = this.state.chart1Options.xAxis;
                        const { data } = this.state.chart1Options.series[0];

                        if (categories !== undefined && data !== undefined) {
                            if (categories.length >= 10 && data.length >= 10) {
                                categories.shift();
                                data.shift();
                            }

                            const timestamp = this.state.newestAverageRating.timestamp;
                            const averageRating = this.state.newestAverageRating.average_rating;
                            var datetime = new Date(timestamp);
                            var month = months[datetime.getMonth()];
                            var date = datetime.getDate();
                            var hours = datetime.getHours();
                            var mins = datetime.getMinutes();
                            var secs = datetime.getSeconds();
                            var millis = datetime.getMilliseconds();

                            var dateString =
                                month +
                                " " +
                                date +
                                " " +
                                hours +
                                ":" +
                                mins +
                                ":" +
                                secs +
                                "." +
                                millis;

                            categories.push(dateString);
                            data.push(averageRating);
                            this.setState({
                                chart1Options: {
                                    xAxis: {
                                        title: {
                                            text: "Timestamp",
                                        },
                                        categories: categories,
                                    },
                                    series: [{ name: "Average Rating", data: data }],
                                },
                            });
                        }
                    }
                );
            } else if (data.type === "average_age") {
                this.setState(
                    {
                        newestAverageAge: data.message,
                    },
                    () => {
                        const { categories } = this.state.chart2Options.xAxis;
                        const { data } = this.state.chart2Options.series[0];

                        if (categories !== undefined && data !== undefined) {
                            if (categories.length >= 10 && data.length >= 10) {
                                categories.shift();
                                data.shift();
                            }

                            const timestamp = this.state.newestAverageAge.timestamp;
                            const averageAge = this.state.newestAverageAge.average_age;
                            var datetime = new Date(timestamp);
                            var month = months[datetime.getMonth()];
                            var date = datetime.getDate();
                            var hours = datetime.getHours();
                            var mins = datetime.getMinutes();
                            var secs = datetime.getSeconds();
                            var millis = datetime.getMilliseconds();

                            var dateString =
                                month +
                                " " +
                                date +
                                " " +
                                hours +
                                ":" +
                                mins +
                                ":" +
                                secs +
                                "." +
                                millis;

                            categories.push(dateString);
                            data.push(averageAge);
                            this.setState({
                                chart2Options: {
                                    xAxis: {
                                        title: {
                                            text: "Timestamp",
                                        },
                                        categories: categories,
                                    },
                                    series: [{ name: "Average Age", data: data }],
                                },
                            });
                        }
                    }
                );
            }
        };
    }

    componentWillUnmount() {
        socket.close();
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
                                            highcharts={Highcharts}
                                            options={this.state.chart1Options}
                                        />
                                    </Paper>
                                </Grid>
                                {/* Line Chart 2 */}
                                <Grid item xs={12} md={4} lg={6}>
                                    <Paper className={classes.paper}>
                                        <HighchartsReact
                                            highcharts={Highcharts}
                                            options={this.state.chart2Options}
                                        />
                                    </Paper>
                                </Grid>
                                {/* Recent Orders */}
                                <Grid item xs={12}>
                                    <Paper className={classes.paper}>
                                        <Title>Recent Customer Reviews</Title>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Clothing ID</TableCell>
                                                    <TableCell>Customer Age</TableCell>
                                                    <TableCell>Title</TableCell>
                                                    <TableCell>Review</TableCell>
                                                    <TableCell>Recommended</TableCell>
                                                    <TableCell>Positive Feedback</TableCell>
                                                    <TableCell>Division</TableCell>
                                                    <TableCell>Department</TableCell>
                                                    <TableCell>Class</TableCell>
                                                    <TableCell align="right">Rating</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {this.state.recentReviews.map((review) =>
                                                    review !== undefined ? (
                                                        <Fade in={review.show}>
                                                            <TableRow key={review.id}>
                                                                <TableCell>
                                                                    {review.clothing_id}
                                                                </TableCell>
                                                                <TableCell>{review.age}</TableCell>
                                                                <TableCell>
                                                                    {review.title}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {review.review}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {review.recommended === 1
                                                                        ? "Yes"
                                                                        : "No"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {review.positive_feedback}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {review.division}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {review.department}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {review.class_name}
                                                                </TableCell>
                                                                <TableCell align="right">
                                                                    {review.rating}
                                                                </TableCell>
                                                            </TableRow>
                                                        </Fade>
                                                    ) : (
                                                        ""
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
                                        <div className={classes.seeMore}>
                                            <Link color="primary" href="#">
                                                See more orders
                                            </Link>
                                        </div>
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
