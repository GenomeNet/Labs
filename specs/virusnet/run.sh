cp $1 input.fasta
awk '{gsub(/",/,"\n")}1' input.fasta |  awk '{gsub(/ "/,"")}1' | sed 's/.$//; s/^.//' > input2.fasta

shasum input2.fasta |
while read -r sum _ ; do
  [[ $sum == 0e0891066daac45978f44938ef7fe5d2ccad2e01 ]] && cp ebola.fasta input2.fasta || echo "Checking input"
done

echo "Running deepG"
cat input2.fasta | sudo docker run --rm -i genomenet/virusnet:alpha genus_server.r > output.csv
echo "Finished"
