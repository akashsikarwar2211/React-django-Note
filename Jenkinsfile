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
                // Remove files left by an interrupted previous build.
                deleteDir()

                // Checkout the branch configured in the Jenkins job.
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
                        echo "Node version:"
                        node --version

                        echo "NPM version:"
                        npm --version

                        npm ci
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
                        echo "Python version:"
                        python --version

                        python -m venv .venv
                        . .venv/bin/activate

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

        always {
            cleanWs()
        }
    }
}
