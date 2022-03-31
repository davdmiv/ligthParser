const cluster = require('cluster');
const http = require('http');
const port = 6006;

const requestHandler = (request, response) => {

    response.writeHead(200);
    if (request.url === '/error') {
        // uncaught exception
        throw new Error('Oh no!')
    } else {
        response.end(`<h1 style="text-align:center;margin-top:40px;">=^..^=</h1>`);
        // notify master about the request
        process.send({cmd: 'notifyRequest'});
    }
};

const server = http.createServer(requestHandler);

// check is cluster master or not
console.log(`Am I master? ${cluster.isMaster ? `YES` : `NO`}! 
             Am I worker? ${cluster.isWorker ? `YES my id is  ${cluster.worker.id}` : `NO`}!`);

if (cluster.isMaster) {

    const cpuCount = require('os').cpus().length;

    // Fork workers.
    for (let i = 0; i < cpuCount; i++) {
        // schedulingPolicy: SCHED_RR or SCHED_NONE
        cluster.schedulingPolicy = cluster.SCHED_NONE;
        // console.log(`schedulingPolicy ${cluster.schedulingPolicy}`);
        cluster.fork();
    }

    // worker's lifecycle
    cluster.on('fork', (worker) => {
        console.log(`Worker #${worker.id} is online =)`);
    });

    cluster.on('listening', (worker, address) => {
        console.log(
            `The worker #${worker.id} is now connected to ${JSON.stringify(address)}`);
        // Worker is waiting for Master's message
        worker.on('message', messageHandler);
    });

    cluster.on('disconnect', (worker) => {
        console.log(`The worker #${worker.id} has disconnected`);
    });

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.id} is dead =(`);
        cluster.fork();
    });

    // Count requests
    let numRequests = 0;

    function messageHandler(msg) {
        if (msg.cmd && msg.cmd === 'notifyRequest') {
            numRequests += 1;
            console.log(`Requests received: ${numRequests}`);
        }
    }

    // Workers are waiting for Master's message
    // Не оптимальное решение! Спасибо пользователю 12345A за найденный баг ;)
    // for (const id in cluster.workers) {
    //    cluster.workers[id].on('message', messageHandler);
    // }

} else {

    server.listen(port + cluster.worker.id, (err) => {

        if (err) {
            return console.log(`Server error ${err}`);
        }
        console.log(`Listening port ${port + cluster.worker.id}`);
    });

    process.on('uncaughtException', (err) => {

        console.error(`${(new Date).toUTCString()} uncaught exception: ${err.message}`);
        console.error(err.stack);
        process.exit(1);
    });
}