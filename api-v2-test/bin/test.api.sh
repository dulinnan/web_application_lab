#!/bin/bash

export PORT=4941 # for all the apps that expect this to be set
export SENG365_PORT=4941 # in case use this to set port
export SENG365_MYSQL_HOST=localhost # use local docker db
export SENG365_MYSQL_PORT=3306 # use local docker db

# default settings
DATE="21 August 2017, 23:55 +1200"  # standard submission date
DROPDEAD="28 August 2017, 23:55 +1200"  # drop-dead date
URL=http://localhost:4941/api/v2

function checkoutRepo {
    # clone repo
    if [ ! -e "${REPOPATH}" ]; then
      git clone git@eng-git.canterbury.ac.nz:${NAMESPACE}/${REPO}.git ${REPOPATH}
      if [ $? != 0 ]; then
        exit 1
      fi
    fi

    # get out of any detached head state
    (cd ${REPOPATH}; git checkout -f master)
    wait

    # get latest SHA before deadline and checkout that version
    REVISION=$(cd ${REPOPATH}; git rev-list --before="$DATE" --max-count=1 HEAD)

    echo "checking out revision $REVISION (last before $DATE)"
    (cd ${REPOPATH}; git checkout -f ${REVISION})
}

function cleanup {
    echo "stopping any previous app"
    PIDGROUP=$(pgrep -o node)
    if [ ! -z "${PIDGROUP}" ]; then # not same as $PID as that is for the initial npm; we want the child process
        echo "killing existing app ${PIDGROUP}"
        kill -s SIGKILL ${PIDGROUP} >/dev/null 2>&1
    fi
    PID4941=$(lsof -ti :4941)
    if [ ! -z "${PID4941}" ]; then
        echo "killing other app ${PID4941}"
        kill -s SIGKILL ${PID4941} >/dev/null 2>&1
    fi
    echo "stopping mysql"
    CONTAINERS=$(docker ps --filter "publish=3306" -q)
    if [ -n "${CONTAINERS}" ]; then
      docker stop ${CONTAINERS} >/dev/null 2>&1
    fi
}

function before {
    cleanup
    echo "starting mysql and app"
    docker run -e MYSQL_ROOT_PASSWORD=secret -p 3306:3306 -d mysql:5.7
    echo "sleep while mysql starts"
    while ! mysql -e "select 1" -uroot -psecret --protocol=tcp >/dev/null 2>&1; do
        sleep 1
    done
    npm --prefix=${REPOPATH} start &
    PID=$!
    echo "running as ${PID}, now sleeping for 10 to allow app to complete setup"
    sleep 10
}


if [ ${#@} == 0 ]; then
cat << USAGE
Usage:
  $0 [OPTIONS] <REPO>
Clone a repo from eng-git and checkout the last revision before the requested date.

Options:
  -d    working directory [optional - default '.']
  -l    if late (use the dropdead data) [optional]
USAGE
    exit 0
fi

DIR=.
while getopts "d:l" option; do
 case "${option}"
 in
 d) DIR=${OPTARG};;
 l) DATE=${DROPDEAD};;
 esac
done

# shift positional arguments
shift $((OPTIND-1))

REPO="$(basename $1)"
REPOPATH=${DIR}/${REPO}

NAMESPACE="${1%/*}"
if [ "$REPO" == "$NAMESPACE" ]; then
  NAMESPACE="seng365-2017"
fi


#echo "cleaning docker"
#docker system prune -f

#checkoutRepo
#wait

echo "installing node modules for app"
(cd ${REPOPATH}; npm install)
wait

echo expecting to find the SUT running on $URL


before
node ../node_modules/mocha/bin/mocha ../test/test.users.unauth --url=${URL}

before
node ../node_modules/mocha/bin/mocha ../test/test.users.auth --url=${URL}

before
node ../node_modules/mocha/bin/mocha ../test/test.projects.create --url=${URL}

before
node ../node_modules/mocha/bin/mocha ../test/test.projects.unauth --url=${URL}

before
node ../node_modules/mocha/bin/mocha ../test/test.projects.auth --url=${URL}

before
node ../node_modules/mocha/bin/mocha ../test/test.projects.closed --url=${URL}

cleanup
