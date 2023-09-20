cp $1 input.json

echo "Reformatting file"
# jobon will give back a json-formatted FASTA file, so we need to format it back to FASTA
python3 -c "import sys, json; print('\n'.join(map(str, json.load(sys.stdin))), end='')" 
< input.json > input_reformatted.fasta

echo "Running inference"
virusnet -i input_reformatted.fasta -o prediction.tsv
echo "Done"
