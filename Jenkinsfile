pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()

        buildDiscarder(
            logRotator(
                daysToKeepStr: '10',
                numToKeepStr: '20'
            )
        )

        timestamps()
        timeout(time: 1, unit: 'HOURS')
        ansiColor('xterm')
    }

    environment {
        CI = 'true'
        PIP_DISABLE_PIP_VERSION_CHECK = '1'
        DOCKER_IMAGE = 'react-django-note'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm

                sh '''
                    echo "Branch: ${BRANCH_NAME:-main}"
                    echo "Commit: $(git rev-parse HEAD)"
                    git log -1 --pretty=oneline
                '''
            }
        }

        stage('Build Frontend') {
            agent {
                docker {
                    image 'node:22-bullseye'
                    reuseNode true
                }
            }

            steps {
                dir('frontend') {
                    sh '''
                        # Use writable directories because the container runs
                        # as the Jenkins UID instead of root.
                        export HOME="${WORKSPACE}/.node-home"
                        export NPM_CONFIG_CACHE="${WORKSPACE}/.npm-cache"

                        mkdir -p "${HOME}"
                        mkdir -p "${NPM_CONFIG_CACHE}"

                        echo "Node version:"
                        node --version

                        echo "NPM version:"
                        npm --version

                        echo "Installing frontend dependencies..."
                        npm ci

                        echo "Building Vite frontend..."
                        npm run build
                    '''

                    archiveArtifacts(
                        artifacts: 'dist/**',
                        fingerprint: true,
                        onlyIfSuccessful: true
                    )
                }
            }
        }

        stage('Check and Test Backend') {
            agent {
                docker {
                    image 'python:3.11-slim'
                    reuseNode true
                }
            }

            steps {
                dir('backend') {
                    sh '''
                        # Use writable directories for Python and pip.
                        export HOME="${WORKSPACE}/.python-home"
                        export PIP_CACHE_DIR="${WORKSPACE}/.pip-cache"

                        mkdir -p "${HOME}"
                        mkdir -p "${PIP_CACHE_DIR}"

                        echo "Python version:"
                        python --version

                        echo "Creating Python virtual environment..."
                        python -m venv .venv
                        . .venv/bin/activate

                        echo "Installing backend dependencies..."
                        python -m pip install --upgrade pip
                        pip install -r requirements.txt

                        echo "Running Django system check..."
                        python manage.py check

                        echo "Checking for missing migration files..."
                        python manage.py makemigrations --check --dry-run

                        echo "Running Django tests..."
                        python manage.py test --verbosity=2
                    '''
                }
            }
        }

        stage('(Optional) Build Docker Image') {
            when {
                expression {
                    return fileExists('Dockerfile')
                }
            }

            steps {
                sh '''
                    echo "Building application Docker image..."

                    docker build \
                        --tag "${DOCKER_IMAGE}:${BUILD_NUMBER}" \
                        .
                '''
            }
        }
    }

    post {
        success {
            echo "Build ${BUILD_NUMBER} succeeded."
        }

        failure {
            echo "Build ${BUILD_NUMBER} failed. Check the failed stage above."
        }

        aborted {
            echo "Build ${BUILD_NUMBER} was aborted."
        }

        always {
            cleanWs()
        }
    }
}
