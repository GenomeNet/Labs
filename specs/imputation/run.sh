cp $1 input.json

echo "Reformatting file"
# json to FASTA
python3 -c "import sys, json; print('\n'.join(map(str, json.load(sys.stdin))), end='')" < input.json > output.fasta

echo "Running deepG"
# run prediction
/home/ubuntu/Labs/tools/imputation.py --input output.fasta --output output --threshold $2 --batch_size 3000
echo "Finished"
