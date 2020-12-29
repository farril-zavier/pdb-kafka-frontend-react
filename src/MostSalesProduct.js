import React, { useState, useEffect, useRef } from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Title from './Title';

function preventDefault(event) {
    event.preventDefault();
}

const useStyles = makeStyles({
    depositContext: {
        flex: 1,
    },
});

const getCurrentDate = (separator = ':') => {

    let newDate = new Date();
    let hours = newDate.getHours();
    let minute = newDate.getMinutes();
    let milisec = newDate.getSeconds();
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();

    return `${hours}${separator}${minute < 10 ? `0${minute}` : `${minute}`}${separator}${milisec < 10 ? `0${milisec}` : `${milisec}`}`;
    return `${year}${separator}${month < 10 ? `0${month}` : `${month}`}${separator}${date}`
}

export default function MostSalesProduct() {
    const classes = useStyles();
    const [data, setData] = useState({
        id: 0,
        productName: "Loading.."
    });
    const [text, setText] = useState("Loading..");
    const [productID, setProductID] = useState(0);
    const [date, setDate] = useState('00:00:00');
    const [show, setShow] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [counter, setCounter] = useState(0);
    const ws = useRef(null);

    useEffect(() => {
        ws.current = new WebSocket("ws://" + window.location.hostname + ":8000" + "/visualization/");
        // ws.current = new WebSocket("ws://" + '2e0bb275ca6f.ngrok.io' + "/visualization/");
        ws.current.onopen = () => console.log("ws openened");
        ws.current.onclose = () => console.log("ws closed");
        return () => {
            ws.current.close();
        }
    }, []);

    useEffect(() => {
        if (!ws.current) return;
        ws.current.onmessage = (message) => {
            if (isPaused) return;
            const data = JSON.parse(message.data);
            // console.log(data);
            if (data.type === "sales") {
                // console.log(data.message);
                setData({
                    id: data.message.id,
                    productName: data.message.productName
                });
                setShow(false);
            }

            // console.log("etto", e);
        }
    }, [isPaused])

    useEffect(() => {
        const timer = setTimeout(() => {
            setText(data.productName);
            setProductID(data.id);
            setDate(getCurrentDate());
            setShow(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [show])

    return (
        <React.Fragment>
            <Title>Most Sales Product</Title>
            <Fade in={show}>
                <Typography component="p" variant="h4">
                    {text}
                </Typography>
            </Fade>
            <Fade in={show}>
                <Typography color="textSecondary" className={classes.depositContext}>
                    Product id : #{productID}
                </Typography>
            </Fade>
            <Typography color="textSecondary" className={classes.depositContext}>
                on {date}
            </Typography>
            <div>
                <Link color="primary" href="#" onClick={preventDefault}>
                    View Detail
                </Link>
            </div>
        </React.Fragment>
    );
}