pipeline {
  agent any
  options {
    timestamps()
    timeout(time: 60, unit: 'MINUTES')
    ansiColor('xterm')
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
          image 'node:18-bullseye'
          args '-u root:root'
        }
      }
      steps {
        dir('frontend') {
          sh 'npm ci'
          sh 'npm run build'
          archiveArtifacts artifacts: 'dist/**', fingerprint: true
        }
      }
    }

    stage('Test & Build Backend') {
      agent {
        docker {
          image 'python:3.11-slim'
          args '-u root:root'
        }
      }
      steps {
        dir('backend') {
          // create venv, install deps, run migrations and tests
          sh '''#!/bin/bash
set -euo pipefail
python -m venv .venv
. .venv/bin/activate
pip install --upgrade pip
if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
python manage.py migrate --noinput
python manage.py test
'''
          archiveArtifacts artifacts: 'db.sqlite3', allowEmptyArchive: true
        }
      }
    }

    stage('(Optional) Build Docker image') {
      when {
        expression { return fileExists('Dockerfile') }
      }
      steps {
        sh 'docker build -t react-django-note:latest .'
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: '**/TEST-*.xml'
      cleanWs()
    }
    success {
      echo 'Build succeeded.'
    }
    failure {
      echo 'Build failed.'
    }
  }
}
