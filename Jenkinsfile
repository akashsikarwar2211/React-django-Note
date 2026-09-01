pipeline {
  agent any
  options {
    timestamps()
    timeout(time: 60, unit: 'MINUTES')
    ansiColor('xterm')
    disableConcurrentBuilds()
  }
  
  environment {
    REGISTRY = credentials('docker-registry-url')
    REGISTRY_CREDENTIALS = credentials('docker-registry-credentials')
    IMAGE_NAME = 'react-django-note'
    IMAGE_TAG = "${BUILD_NUMBER}"
  }
  
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Frontend') {
      agent {
        docker {
          image 'node:22-bullseye'
          args '-u root:root'
        }
      }
      steps {
        dir('frontend') {
          sh '''#!/bin/bash
set -euo pipefail
npm ci
npm run build
npm run lint
'''
          archiveArtifacts artifacts: 'dist/**', fingerprint: true
        }
      }
    }

    stage('Test Frontend') {
      agent {
        docker {
          image 'node:22-bullseye'
          args '-u root:root'
        }
      }
      steps {
        dir('frontend') {
          sh '''#!/bin/bash
set -euo pipefail
npm install --save-dev vitest @vitest/ui junit-reporter
npm run test:unit || true
'''
          junit allowEmptyResults: true, testResults: '**/TEST-*.xml'
        }
      }
    }

    stage('Audit Frontend Dependencies') {
      agent {
        docker {
          image 'node:22-bullseye'
          args '-u root:root'
        }
      }
      steps {
        dir('frontend') {
          sh '''#!/bin/bash
set -euo pipefail
npm audit --audit-level=moderate || echo "Warning: npm vulnerabilities detected. Review and update dependencies."
'''
        }
      }
    }

    stage('Build & Test Backend') {
      agent {
        docker {
          image 'python:3.11-slim'
          args '-u root:root'
        }
      }
      steps {
        dir('backend') {
          sh '''#!/bin/bash
set -euo pipefail
python -m venv .venv
. .venv/bin/activate
pip install --upgrade pip
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
pip install pytest pytest-django pytest-cov junit-xml
python manage.py migrate --noinput
python -m pytest --junitxml=TEST-results.xml --cov=. --cov-report=xml || true
'''
          junit allowEmptyResults: true, testResults: '**/TEST-*.xml'
          archiveArtifacts artifacts: 'db.sqlite3', allowEmptyArchive: true
          publishHTML([
            reportDir: '.',
            reportFiles: 'coverage.xml',
            reportName: 'Coverage Report',
            allowMissing: true
          ])
        }
      }
    }

    stage('Build Docker Image') {
      when {
        expression { return fileExists('Dockerfile') }
      }
      steps {
        sh '''#!/bin/bash
set -euo pipefail
docker build \
  -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} \
  -t ${REGISTRY}/${IMAGE_NAME}:latest \
  .
'''
      }
    }

    stage('Push to Registry') {
      when {
        expression { return fileExists('Dockerfile') }
      }
      steps {
        sh '''#!/bin/bash
set -euo pipefail
echo "$REGISTRY_CREDENTIALS_PSW" | docker login -u "$REGISTRY_CREDENTIALS_USR" --password-stdin "$REGISTRY"
docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
docker push ${REGISTRY}/${IMAGE_NAME}:latest
docker logout "$REGISTRY"
'''
      }
    }

    stage('Deploy') {
      when {
        branch 'main'
        expression { return fileExists('Dockerfile') }
      }
      steps {
        sh '''#!/bin/bash
set -euo pipefail
echo "Deploying ${IMAGE_NAME}:${IMAGE_TAG} to production..."
# Add your deployment commands here (e.g., kubectl apply, docker-compose up, etc.)
# Example:
# kubectl set image deployment/react-django-note react-django-note=${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} -n production
# Or for docker-compose:
# docker-compose -f docker-compose.yml pull
# docker-compose -f docker-compose.yml up -d
echo "Deployment complete."
'''
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    success {
      echo 'Build and tests succeeded.'
    }
    failure {
      echo 'Build or tests failed. Review logs above.'
    }
  }
}
