import React from 'react';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Title from './Title';

function preventDefault(event) {
    event.preventDefault();
}

const useStyles = makeStyles({
    depositContext: {
        flex: 1,
    },
});

export default function MostSalesProduct() {
    const classes = useStyles();
    return (
        <React.Fragment>
            <Title>Most Sales Product</Title>
            <Typography component="p" variant="h4">
                Product name
            </Typography>
            <Typography color="textSecondary" className={classes.depositContext}>
                on 15 March, 2019
            </Typography>
            <div>
                <Link color="primary" href="#" onClick={preventDefault}>
                    View Detail
        </Link>
            </div>
        </React.Fragment>
    );
}